# The nightly job: the same steps run.py runs, as tasks with dependencies.
# A task runs only when the one before it succeeded, so a gate that exits 1
# (G3, G4) stops every task after it: the gate policy, in the job's shape.
data "databricks_spark_version" "lts" {
  long_term_support = true
}

data "databricks_node_type" "small" {
  local_disk = true
}

locals {
  tasks = ["bronze", "silver", "g3", "gold", "g4"] # G2 runs inside bronze
}

resource "databricks_job" "lc_exposure" {
  name = "lc-exposure"

  git_source {
    url      = "https://github.com/schemabotview/azure-trade-finance"
    provider = "gitHub"
    branch   = "main"
  }

  job_cluster {
    job_cluster_key = "nightly"
    new_cluster {
      spark_version      = data.databricks_spark_version.lts.id
      node_type_id       = data.databricks_node_type.small.id
      num_workers        = 1
      data_security_mode = "SINGLE_USER"
    }
  }

  dynamic "task" {
    for_each = local.tasks
    content {
      task_key        = task.value
      job_cluster_key = "nightly"
      dynamic "depends_on" {
        for_each = task.key == 0 ? [] : [local.tasks[task.key - 1]]
        content {
          task_key = depends_on.value
        }
      }
      spark_python_task {
        python_file = "pipeline/${task.value}.py"
      }
    }
  }

  # A failed night tells the risk engineers, not just a log (§11.4).
  email_notifications {
    on_failure = ["trade-risk@syndicabank.example"]
  }

  # ONE scheduler owns the night: Data Factory's trigger starts the extract,
  # then this job. The job's own schedule exists, paused, so nobody turns it
  # on by mistake and runs the night twice (§11.6).
  schedule {
    quartz_cron_expression = "0 30 2 * * ?"
    timezone_id            = "UTC"
    pause_status           = "PAUSED"
  }
}

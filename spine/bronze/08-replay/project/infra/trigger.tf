# Every night at 02:00, the window that just ended: a TUMBLING window trigger.
# Each window runs once, in order, and a failed one can be rerun on its own;
# the window's end is the extract's window_end, and its batch number counts
# days from the first batch's day. Created stopped: started when the bank is.
locals {
  end  = "trigger().outputs.windowEndTime"
  day1 = "ticks('2026-09-20T02:00:00Z')" # the day before batch 1
  day  = 864000000000                    # ticks in a day
  days = "div(sub(ticks(${local.end}), ${local.day1}), ${local.day})"
}

resource "azurerm_data_factory_trigger_tumbling_window" "nightly" {
  name            = "tr_nightly_0200"
  data_factory_id = azurerm_data_factory.main.id
  start_time      = "2026-10-31T02:00:00Z"
  frequency       = "Hour"
  interval        = 24
  max_concurrency = 1
  activated       = false

  pipeline {
    name = azurerm_data_factory_pipeline.main["pl_extract"].name
    parameters = {
      window_end = "@trigger().outputs.windowEndTime"
      batch_id   = "@{${local.days}}"
    }
  }
}

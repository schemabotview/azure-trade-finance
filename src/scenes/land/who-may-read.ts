import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { level } from '../level'
import { landTree } from './tree'
import code from '../../../spine/land/09-who-may-read/project/extract/share.py?raw'
import session from '../../../spine/land/09-who-may-read/session.txt?raw'
import storage from '../../../spine/land/09-who-may-read/project/infra/modules/storage/main.tf?raw'

// §5.9 — who may read a batch (recorded on Azure). Three ways in, each read from the recording: the
// RBAC role on the account, the POSIX-style ACL on a directory, and a user delegation SAS for one
// file (200 with its signature, 409 without: public access is off). The lifecycle rule is Terraform
// (applied in the same session); its days are the module's.
const role = outputOf(session, 'az role assignment list --scope $ID --query "[].roleDefinitionName" -o tsv').trim()
const acl = outputOf(session, 'az storage fs access show -f reference -p group_limits --query acl -o tsv').trim()
const withSas = outputOf(session, 'curl -so /dev/null -w "%{http_code}\\n" "$URL"').trim()
// The rule's days, read from the module it was applied from: never typed twice
const RULE = [...storage.matchAll(/(\w+)_after_days_since_modification_greater_than\s*=\s*(\d+)/g)].map((m) => [m[1], Number(m[2])] as [string, number])
const days = (action: string) => RULE.find(([a]) => a === action)![1]
const without = outputOf(session, 'curl -so /dev/null -w "%{http_code}\\n" "${URL%%\\?*}"').trim()

export const landWhoMayRead: SceneModel = ideFrame({
  tree: landTree('extract/share.py', {
    extra: ['extract/g1.py', 'extract/reference.py', 'extract/share.py', 'infra/main.tf', 'infra/modules/storage/main.tf'],
    fresh: ['extract/share.py', 'infra/modules/storage/main.tf'],
  }),
  editor: { file: 'extract/share.py', code, show: [[1, 7], [lineOf(code, 'name, as_of'), lineOf(code, 'print(f"')]], highlight: [lineOf(code, 'get_user_delegation_key'), ...linesFrom(code, 'sas = generate_blob_sas', 'permission=')] },
  session,
  keep: ['$ terraform apply', 'Apply complete!', '$ az storage fs access show', acl, ['$ URL=', without]],
  side: [
    // the verification label rides at the top of the first part; the lifecycle diagram is the second
    {
      type: 'group', id: 'access', bare: true, children: [
        level('recorded on Azure', 'run once on the course’s subscription; its ids are normalised'),
        {
          type: 'table', id: 'ways', title: 'Three ways into a batch', tone: 'ingest', columns: ['way, granted on', 'here'], rows: [
            { id: 'w-rbac', cells: ['RBAC role: the account', role] },
            { id: 'w-acl', cells: ['ACL: one directory', acl] },
            { id: 'w-sas', cells: ['SAS link: one file, 4 h', `${withSas}; unsigned ${without}`], tone: 'store' },
          ],
        },
      ],
    },
    {
      type: 'group', id: 'life', title: 'landing/lc_deals/: the lifecycle rule', icon: 'clock', tone: 'store', dir: 'row', children: [
        { type: 'item', id: 'l-hot', title: 'hot', sub: `days 0–${days('tier_to_cool')}`, icon: 'zap', stack: true },
        { type: 'item', id: 'l-cool', title: 'cool', sub: `after ${days('tier_to_cool')} d`, icon: 'archive', stack: true },
        { type: 'item', id: 'l-archive', title: 'archive', sub: `after ${days('tier_to_archive')} d`, icon: 'archive', stack: true },
        { type: 'item', id: 'l-delete', title: 'deleted', sub: `after ${days('delete')} d`, icon: 'lock', tone: 'consume', stack: true },
      ],
    },
  ],
  edges: [
    { from: 'l-hot', to: 'l-cool' },
    { from: 'l-cool', to: 'l-archive' },
    { from: 'l-archive', to: 'l-delete' },
  ],
})

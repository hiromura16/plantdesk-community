/** タスクワークスペースの公開部品。状態管理と表示をそれぞれの担当へ分けています。 */

import { useTeamWorkspace } from './team/use-workspace.jsx';
import { TeamWorkspaceView } from './team/workspace-view.jsx';
export function TeamWorkspace(props) {
  return <TeamWorkspaceView {...useTeamWorkspace(props)} />;
}

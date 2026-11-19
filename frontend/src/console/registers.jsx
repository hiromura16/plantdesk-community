/** 設備・工事台帳の公開部品。状態管理と表示をそれぞれの担当へ分けています。 */

import { useRegister } from './register/use-register.jsx';
import { RegisterView } from './register/register-view.jsx';
export function Register(props) {
  return <RegisterView {...useRegister(props)} />;
}

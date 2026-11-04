import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import App from './App.jsx';

const root=createRoot(document.getElementById('root'));
// 同步完成首次渲染，保证页面 load 事件触发时 iframe 和表单已经存在。
flushSync(()=>root.render(<App/>));

// 对外保留原有入口，测试通过 import('/app.js') 调用。
export {render} from './axiom-bridge.js';

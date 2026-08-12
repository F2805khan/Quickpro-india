import fs from 'fs';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync('admin/dist/index.html', 'utf-8');
const dom = new JSDOM(html, {
  url: 'http://localhost:5000/',
  runScripts: 'dangerously',
  resources: 'usable'
});

dom.window.addEventListener('error', (event) => {
  console.log('JSDOM ERROR:', event.error);
});

dom.window.addEventListener('unhandledrejection', (event) => {
  console.log('JSDOM PROMISE REJECTION:', event.reason);
});

console.log('JSDOM started...');
setTimeout(() => {
  console.log('JSDOM finished waiting.');
  console.log('Body HTML:', dom.window.document.body.innerHTML.slice(0, 200));
}, 5000);

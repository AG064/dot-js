// Minimal test to check if framework works
import { div, h1, p, createDOM } from '../framework/src/nexus';

function test() {
  const element = div([
    h1('Hello Nexus'),
    p('This is a test'),
  ]);
  console.log('Element:', element);
  const node = createDOM(element);
  console.log('Node:', node);
  document.getElementById('app').appendChild(node);
}

test();
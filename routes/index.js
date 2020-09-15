let express = require('express');
let router = express.Router();
let template = require('../lib/template.js');
let auth = require('../lib/auth');

router.get('/', function(request, response) { 
  // 어떤 정보가 세션 객체에 들어가 있는지 확인
  //console.log(request.session);  
  let title = 'Welcome';
  let description = 'Hello, Node.js';
  let list = template.list(request.list);
  let html = template.HTML(title, list,
    `
    <h2>${title}</h2>${description}
    <img src="/images/hello.jpg" style="width:300px; display:block; margin-top:10px;">
    `,
    `<a href="/topic/create">create</a>`,
    auth.statusUI(request, response)
  ); 
  response.send(html);
});
  
module.exports = router;



let express = require('express');
let router = express.Router();
// let path = require('path');
// let fs = require('fs');
// let sanitizeHtml = require('sanitize-html');
let template = require('../lib/template.js');

//* 1인용 사이트라고 가정.
let authData = {
  email:'a@a.com',
  // 실제로는 패스워드는 소스코드 따로 빼야하고, 평문 패스워드도 암호화 해야함
  password:'121212',
  nickname:'hewas' 
};

router.get('/login', function(request, response) {
  let title = 'WEB - login';
  let list = template.list(request.list);
  let html = template.HTML(title, list, `
    <form action="/auth/login_process" method="post">
      <p><input type="text" name="email" placeholder="email"></p>
      <p><input type="password" name="pwd" placeholder="password"></p>
      <p>
        <input type="submit" value="login">
      </p>
    </form>
  `, '');
  response.send(html);
});

router.post('/login_process', function(request, response) {  
  let post = request.body;
  let email = post.email;
  let password = post.pwd;
  if(email === authData.email && password === authData.password) {    
    // 이제 여기에 페이지 로딩마다 필요한 사용자의 닉네임이나 로그인 중인지 여부 등을 저장함
    request.session.is_logined = true;      
    request.session.nickname = authData.nickname;

    // 이 콜백함수 안 코드가 모두 실행된 다음에, session 미들웨어는 위 닉네임 값을 세션스토어에 기록하는 작업을 시작함 == 메모리에 저장된 세션 데이터를 저장소에 반영하는 작업
    // 만약 저장소가 느려졌다 치면, 저장하기도 전에 redirect 되버림 -> 이럴때 사용하는 것이 아래 save 함수, 세션 객체에 있는 데이터를 이 함수가 세션 스토어에 바로 적용, 반영함 -> 이 작업이 모두 끝나면 파라미터로 전달된 콜백함수를 호출하도록 약속됨 -> redirect를 콜백함수 안으로 이동
    request.session.save(function(){
      response.redirect('/');
    });    
  } else{
    response.send('Who?');
  }  
});

router.get('/logout', function(request, response) {
  request.session.destroy(function(err) {
    response.redirect('/');
  })
});

module.exports = router;





// 수업을 마치며: http로 통신하고 있다는 것은 이미 누군가 우리 통신내용을 보고 있다고 간주해도 됨, 세션 아이디를 도둑맞는다면 누군가 대신 로그인 가능, 
//! 현실에서는 꼭 https로 통신해야 함, 세션 옵션에서 secure: true 로 하면 https에서만 세션 정보를 주고 받도록 처리 가능

// 또 사용자가 전송한 데이터에 자바스크립트가 포함 및 활성되면 사용자는 js를 이용해서 세션 쿠키 아이디를 탈취해서 전송할 수 있음, 이를 막기 위해서는 사용자가 전송한 데이터에서 js를 사용 못하게 해야함, 또 세션의 옵션으로 httponly: true 로 지정하면 js를 통해서 세션 쿠키를 사용할 수 없도록 강제할 수 있다

// 회원이 많아지면 앱이 복잡해짐 - 회원의 등록, 인증, 비번복구 대안마련, 로그인시 해당 회원 조회 기능 등 -> 다중 사용자를 수용할 수 있는 서비스 만들어보기

// federation authentication (타사인증): 구글, 페북 등 타사의 회원정보를 보관해두고, 자사에서 회원에 대한 식별만을 하는 인증방법, 이것을 이용하면 고도의 주의가 요구되는 회원정보관리는 구글, 페북 등에게 맡기고 자사는 회원의 식별자만을 유지함으로서 보안사고를 방지할 수 있음 + 회원가입의 간편함 
//! -> 이를 가능하게 해주는 도구가 oauth, Passport 라이브러리 등이 있다
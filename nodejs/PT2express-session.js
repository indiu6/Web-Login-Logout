// 쿠키는 웹 브라우저에 저장되는 '키-밸류' 타입의 데이터. 따라서 누구나 키에 따른 밸류를 확인할 수 있으므로 비밀정보를 쿠키로 보낸다면 비밀 정보를 아주 쉽게 탈취당할 수 있음. 세션은 이러한 문제점을 고려해서, 쿠키를 업그레이드 한 것이라 보면 됨. 쿠키와 달리 서버에 데이터를 저장하고 웹 브라우저는 Session ID만을 갖고 있기 때문에 비교적 안전. ​

// 세션의 동작을 요약하면 ​

// a. 서버는 웹 브라우저에게 세션 값을 보냄. (sid 라고 하며, 아무런 의미도 없는 단순 식별자)
// b. 클라이언트는 접속할 때 자신이 가지고 있는 sid를 서버에게 전달
// c. 서버는 클라이언트가 보내준 sid를 가지고, 해당 유저를 식별

let express = require('express');
let session = require('express-session');
// 1. Session data is not saved in the cookie itself, just the session ID. Session data is stored server-side(파일이나 db형태로 저장)

//* 6-1. ('session-file-store' 대신 mysql, mongoDB 등 다른거 사용도 가능)
// https://www.npmjs.com/package/connect-mongo, MongoStore = require('connect-mongo')(session);
let FileStore = require('session-file-store')(session);

let app = express();

// 2. session(options), app.use는 사용자의 요청이 있을때마다 session() 함수를 옵션 값에 맞게 실행한다
app.use(session({
    // 3. 필수 옵션 secret은 'keyboard cat'으로 랜덤한 값을 입력해줌, 이것을 통해 Session Id를 암호화하여 관리함. 외부에 노출되어선 안됨, 버전관리를 한다면 소스코드에 포함시켜선 안되고 별도의 파일로 빼거나, 실서버에 올릴 때는 변수처리나 다른 방법으로 올려야 함
    secret: 'asih&%$$***KEYBOARD*cat',    
    // resave 옵션 flase: 세션 데이터가 바뀌기 전까지는 세션저장소의 값을 저장하지 않음 / true: 값이 바뀌든 아니든 계속 저장소에 저장함
    // 세션을 다 공부한 다음 이해할 수 있으므로, 지금은 그냥 false
    resave: false,
    // saveUninitialized 옵션 true: 세션이 필요하기 전까지는 세션을 구동시키지 않는다 / false: 세션 필요하든말든 구동시키기 때문에 서버에 부담을 줌
    saveUninitialized: true,

    // 현재 예제에서 http로 통신하고 있다는 것은 이미 누군가 우리 통신내용을 보고 있다고 간주해도 됨, 세션 아이디를 도둑맞는다면 누군가 대신 로그인 가능(e코네스토가 예), 현실에서는 꼭 https로 통신해야 함, https://support.google.com/chrome/answer/95617?visit_id=637340842440569293-2500039080&p=ui_security_indicator&rd=1 
    // 세션 옵션에서 secure: true 로 하면 https에서만 세션 정보를 주고 받도록 처리 가능
    // secure: true
    
    //* 6-2. 아래 입력 후 sessions 폴더에 저장된 파일 화면분할한 다음 크롬 새로고침으로 num값 변경 확인.
    // 디폴트 옵션으로 ./sessions 폴더 자동으로 생성됨
    store: new FileStore()
    // 몽고디비 스토어
    //store: new MongoStore(options)
}));

app.get('/', function (req, res, next) {
    // 4. 이제 세션 미들웨어가 req 객체의 프로퍼티로 session이라고 하는 객체를 추가해 줌 -> 위에서 app.use(session()) 때문
    // 세션 형태 {"_expires":null, "originalMaxAge":null, "httpOnly":true} 설명: 
    // maxage는 밀리세컨즈로, expires는 날짜로 둘다 언제 세션이 만료될지 표시함, 
    // 사용자가 전송한 데이터에 만약 자바스크립트가 포함 및 활성화되면 사용자는 js를 이용해서 세션 쿠키 아이디를 탈취해서 전송할 수 있음, httponly: true는 js를 통해서 세션 쿠키를 사용할 수 없도록 강제할 수 있음
    console.log(req.session);  

    if(req.session.num === undefined) {
        // 미들웨어가 내부적으로 세션 저장소라는 곳에 num = 1 값을 저장 -> 세션 저장소는 기본값으로 MemoryStore 라는 곳에 저장한다(휘발성)
        // 즉 node를 끄면 값이 사라지고 다시 켜면 num은 1부터 시작.
        req.session.num = 1;
    } else {
        // 그다음 요청할 때 저장된 num의 값을 가져옴
        req.session.num = req.session.num + 1;    
    }
    // 5. 크롬으로 페이지 새로고침 해서 확인해보기
    res.send(`Views: ${req.session.num}`);
});

// 6-1. 세션 미들웨어는 일개 미들웨어지만 방대한 생태계를 갖고 있다, 여러가지 db와 저장하는 방법마다 모듈들이 쪼개져 있음, 인트로 페이지 하단에 Compatible Session Stores 소제목으로 이동 -> 아래 항목들 중 session-file-store 링크 클릭. npm i -s session-file-store
// Usage 에서 'FileStore=require(..)' 코드를 let session 아래에 복붙

//* auth.js 추가로 더 설명? main.js 켜고 예시 로그인 로그아웃 등

app.listen(3000, function() {
    console.log('PT2 APP is listening on port 3000!');
});
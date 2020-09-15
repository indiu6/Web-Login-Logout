// Node.js는 JavaScript 엔진에 API를 제공하는 기반 라이브러리(libuv)를 연결한 응용 런타임 플랫폼. 
// Node.js 홈페이지의 설명에도 런타임이라 표기되어 있다.
// 익스프레스는 node.js의 웹 프레임워크. 미들웨어를 지원하는 기능이 거의 전부라 할 수 있다.
// 제너레이터로 만든 app.js가 기본 형식, main.js-이 파일에서 만든것은 모범적인 코드가 아니라 배우기 쉬운 코드였음
// npm i 하면 package.json 파일에 있는 디펜던시의 목록을 npm이 설치해준다
const express = require('express');
const app = express() ;
const fs = require('fs');

// 아래는 third party 미들웨어
let bodyParser = require('body-parser');
let compression = require('compression');

let helmet = require('helmet'); // npm i helmet --save
app.use(helmet()); // 기본적인 보안취약점 9가지 해결 모듈
// npm i(=install) nsp -g 이거 사라져서 npm audit 으로 대체


let session = require('express-session');
// (이거 대신 mysql, mongoDB 등 다른거 사용도 가능)
// https://www.npmjs.com/package/connect-mongo, MongoStore = require('connect-mongo')(session);
let FileStore = require('session-file-store')(session);


// 정적인 파일이 있는 퍼블릭 폴더를 불러옴, 여기선 css
app.use(express.static('public'));

// json 보다 어렵고 복잡한데 일단 넘어감
// bodyParser.쭉 뒤 이 부분은 바디파서가 만들어내는 미들웨어를 표현하는 표현식
// 이 코드는 main.js 가 실행될 때마다, 즉 사용자가 요청할 때마다 위 부분으로 만들어진 미들웨어가 실행됨
// 그게 어떻게 생겼는지는 알 필요 없음
// app.post('/create_process', function(req,res) -> topic.js 파일안에 있는 이 코드에서 더 설명
app.use(bodyParser.urlencoded({extended:false}));
// 웹페이지 캐시 삭제하고 강제 리로드 Ctrl Shift R
app.use(compression());


// use는 사용자의 요청이 있을때마다 session() 함수를 실행, 
app.use(session({
  // required option 'secret', 외부에 노출되어선 안됨, 버전관리를 한다면 소스코드에 포함시켜선 안되고 별도의 파일로 빼거나 하고
  // 실서버에 올릴 때는 변수처리나 다른 방법으로 올려야 함
  secret: 'asih&%$*sa%$d',    
  // resave 옵션 flase: 세션 데이터가 바뀌기 전 까지는 세션저장소의 값을 저장하지 않음 / true: 값이 바뀌든 아니든 계속 저장소에 저장함
  // 세션을 다 공부한 다음 이해할 수 있으므로, 지금은 그냥 false
  resave: false,
  // saveUninitialized 옵션 true: 세션이 필요하기 전 까지는 세션을 구동시키지 않는다 / false: 세션 필요하든말든 구동시키기 때문에 서버에 부담을 줌
  saveUninitialized: true,
  
  // 아래 입력 후 sessions 폴더에 저장된 파일 화면분할한 다음 크롬 새로고침으로 num값 변경 확인.
  // 디폴트 옵션으로 ./sessions 폴더 자동으로 생성됨
  store: new FileStore()
}));


// app.get은 모든 경로 path와 함수를 받는다. post방식 접근에서는 실행되지 않는다.
app.get('*' ,function(req, res, next){
  fs.readdir('./data', function(error, filelist){
    req.list = filelist;
    next();
  });
});

// topic.js 파일을 라우트 폴더에 만들어서 코드를 훨씬 간결하게 만듦
// 토픽파일에 경로에 /topic 은 필요 없으므로 다 지움
//* main.js 파일은 '대문'이기 때문에 복잡하면 안좋다
let indexRouter = require('./routes/index');
let topicRouter = require('./routes/topic');
let authRouter = require('./routes/auth');


// '/', 'topic' 으로 시작하는 주소에 indexRouter, topicRouter라고 하는 이름의 미들웨어를 적용하겠다는 뜻
app.use('/', indexRouter);
app.use('/topic', topicRouter);
app.use('/auth', authRouter);



// 어떤 웹 프레임워크를 배우던간에, 젤 먼저 체크해야 할 것은 '어떻게 라우트 하는가'이다
// 패스별로 어떻게 응답하는가, get post 로 접속했을때 그것을 어떻게 구분해서 응답하는가
// 이것이 첫번째

// 두번째는 미들웨어, 누구도 소프트웨어를 시작부터 끝까지 직접 다 만들지 않는다
// 다른 사람이 만든 소프트웨어를 부품으로 해서 내 것을 만든다 - 덕분에 생산성 향상
// express 에서는 다른 사람이 만든 것을 미들웨어 라고 한다 (간단한 정의, 보통 함수형식?)
//* app.use 로 미들웨어 사용


// 이게 더 쉬운데 일단 넘어감
// app.use(bodyParser.json());


// 미들웨어는 순차적으로 실행됨(next 파라미터 때문?), 여기까지 쭉 못찾으면 밑의 에러문구 실행
app.use(function(req, res, next){
  res.status(404).send("Sorry can't find that");
});

//* 4개의 파라미터를 가지고 있는 함수는 Express 에서 에러를 핸들링하는 미들웨어로 정하자고 약속됨
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send("Something broke!");
})

app.listen(3000, function() {
  console.log('Example app listening on port 3000!')
});

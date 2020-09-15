module.exports = {
    // 모듈은 기본적으로 이름이 있기 때문에 아래 프로퍼티의 prefix 'auth'는 없어도 됨

    // check if user is logined
    isOwner: function(request, response) {  
        if(request.session.is_logined) {
            return true;
        } else {
            return false;
        }
    },
    statusUI: function(request, response) {
        let authStatusUI = '<a href="/auth/login">login</a>';
        if (this.isOwner(request, response)) {
            authStatusUI = `${request.session.nickname} | <a href="/auth/logout">logout</a>`;
        }
        return authStatusUI;
    }
};


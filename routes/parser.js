fsm = function(str) {
    head = 0;
    tail = 0;
    stack = [];
    parsed = [];
    isToken = function(ch) { return /\S/.test(ch); }
    isWs = function(ch) { return !isToken(ch); }
    isQuote = function(ch) { return ch == options.quote; }

    nodes = {
        init: function(str) {
            if(str.length < 1) {
                this.transition('init', 'err', {message: 'Blank string received'});
            } else if (/\S/.test(msg[this.head])) {
                this.head += 1;
                this.transition('init', 'token');
            } else if (msg[this.head] == '\'') {
                this.head += 1;
                this.tail = this.head;
                this.transition('init', 'qs');
            } else if (str.startsWith(options.cmdPrefix)) {
                this.head += options.cmdPrefix.length;
                this.tail += this.head;
                this.transition('init', 'cmd');
            } else if (/\s/.test(msg[this.head])) {
                this.head += 1;
                this.tail = this.head;
                this.transition('init', 'ws');
            } else {
                this.transition('init', 'err');
            }
        },
        token: function(str) {
            if(isToken(str[this.head])) {
                this.head += 1;
                this.transition('token', 'token');
            } else if (isWs(str[this.head])) {
                parsed.push(str.slice(tail,head));
                head += 1;
                tail = head;
                this.transition('token', 'ws');
            }
        },
        ws: function(str) {
            if(isToken(str[head])) {
                tail = head;
                head += 1;
                this.transition('ws', 'token');
            } else if (isWs(str[head])) {
                head += 1;
                this.transition('ws', 'ws');
            } else if (isQuote(str[head])) {
                head += 1;
                tail = head;
                this.transition('ws', 'qs');
            } else {
                this.transition('ws', 'err');
            }
        },
        qs: function(str) {
            if (isQuote(ch)) {
                parsed.push(str.slice(tail, head));
                head += 1;
                tail = head;
                tra
            }
            if (isToken(ch)) {
                head += 1;
                this.transition('qs', 'qs');
            }
        }

    }
}

edges = [
    {a:'init', b:'*'}
]
head = 0;
tail = 0;

state = 0;

if (a < 1) {
    return {err: {message: 'Cannot parse an empty string'}};
}

while (state != 'end'){
    cur = a[head];

}

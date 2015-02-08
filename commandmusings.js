var s = '';

case (s) {
    case 'help':
        for (var a in cmds.args) {
            if (a.required) {

            }
        }
        break;
}



arg:validate,exec

token is a string with argument name and parameters


or

arg : {
    want: {},
    required: true,
    repeat: true,
    validate: function(){}
}


eg autojoin

autojoin: {
    want:{
        '-' : {
            exec: function(args) {
                options.remove({key: 'autojoin', value: {$in: args}});
            },
            repeat: true,
            want: {type: String, validate: function(arg) {
                return arg.startsWith('#');
            }}
        },
        '+' : {
            want: {
                type:String,
                validate: function(arg){
                    return arg.startsWith('#');
                }
            },
            requiredArgs: true,
            min-args: 1,
        }
    },
    exact-args: 1,
    repeat: false,
    validate: function(token) {
        return token.startsWith('#');
    }
}

var parser = function() {
    commands = {};
    this.getCommands = function() {
        return Object.keys(commands);
    };

    //input Array(string)
    this.handle = function(input,cmd) {
        //if (!input || input.length < 1}) {
            //console.log('Input cannot be empty');
            //return;
        //}
        if(!input) console.error('Input must be defined');
        if(typeof(cmd)==='undefined') cmd = commands;

        if('_pre' in cmd && typeof(cmd._pre)==='function') {
            cmd._pre();
        }

        if ('want' in cmd && cmd.want[input[0]]) {
            if ('type' in cmd.want[input[0]] && !(typeof(input[0])===cmd.want[input[0]].type)) {
                console.error('Type error.  Expected ', cmd.want[input[0]].type, ' got ', typeof(input));
                return false;
            }

            if ('validate' in cmd.want[input[0]] && !(cmd.want[input[0]].validate())) {
                console.error('Validation of want failed!');
                return false;
            }

            this.handle(cmd.want[input[0]].slice(1));
        }

        if('_post' in cmd && typeof(cmd._post)==='function') {
            cmd._post();
        }
            if ('exec' in cmd) {
                if (typeof(cmd.exec) === 'function') {
                    cmd.exec();
                }
            }
        } else {
            console.log('Next argument not recognized.');
        }


    }
}


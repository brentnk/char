var parser = function() {
    this.commands = {};
    this.getCommands = function() {
        return Object.keys(commands);
    };

    //input Array(string)
    this.handle = function(input,cmd) {
        if (!input || input.length < 1}) {
            console.log('Input cannot be empty');
            return true;
        }

        if(!input) console.error('Input must be defined');
        if(typeof(cmd)==='undefined') cmd = commands;

        // Pre processing hook
        if('_pre' in cmd && typeof(cmd._pre)==='function') {
            cmd._pre();
        }

        // Check if command takes (wants) any args.
        if ('want' in cmd && cmd.want[input[0]]) {
            // Return true or false if arg is valid
            if ('validate' in cmd.want[input[0]] && !(cmd.want[input[0]].validate())) {
                console.error('Validation of want arg failed!');
                return false;
            }

            this.handle(cmd.slice(1), cmd.want[input[0]]);
        } else if ('exec' in cmd) {
            if (typeof(cmd.exec) === 'function') {
                cmd.exec(input);
                if('repeat' in cmd) {
                    this.handle(input.slice(1));
                }
            }
        } else {
            console.error('No `want` or `exec` clause found!');
        }

        if('_post' in cmd && typeof(cmd._post)==='function') {
            cmd._post();
        }
    }
}

exports = module.exports = parser;

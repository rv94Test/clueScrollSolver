const Discord = require('discord.js');
const client = new Discord.Client();
let tower;

client.on('ready', () => {
    tower = new Tower();
    console.log('ready');
});

client.on('message', message => {
    if (isMentioned(message, client.user.id)) {
        const msg = message.content.replace(new RegExp('<@[!a-zA-Z0-9]*> '), '');
        if (msg !== '') {
            switch (msg) {
                case 'help':
                    message.reply(process.env.HELP_TEXT);
                    break;
                default:
                    break;
            }
        }
    }
    tower.setTower(message.content);
    if (tower.isTower() && message.author.id !== client.user.id) {
        message.reply(tower.solutions());
    }
    
    if (message.content.includes('REE') || message.content.includes('reee')) {
        for (let i = 0; i < 10; i++) {
            message.author.send(message.content).then().catch(console.error);
        }
    }
});

function isMentioned(message, id) {
    for (let i = 0; i < message.mentions.users.array().length; i++)
        if (message.mentions.users.array()[i].id === id)
            return true;
    return false;
}


// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);

class Tower {
    constructor() {
        this._tower = '';
        this._boardSize = 5;
        this._boards = [];
        this._towersTmp = [];
        this._seperator = '-';
        this._variableBoardSize = false;

        const row = this._pN(this._boardSize);
        this._boards[this._boardSize] = this._generateBoard(row, this._boardSize);
        this._towersTmp[this._boardSize] = this._towers();
    }

    setTower(tower) {
        this._tower = tower;
    }

    _towers() {
        return this._boards[this._boardSize].reduce((acc, b) => {
            const key = [...b.map(this._towerCount), ...b.map((r) => this._towerCount(r.slice().reverse())),
                ...this._transpose(b).map(this._towerCount), ...this._transpose(b).map((r) => this._towerCount(r.slice().reverse()))].join("");
            if (!acc.hasOwnProperty(key)) {
                acc[key] = [];
            }
            acc[key].push(b);
            return acc;
        }, {});
    }

    _towerSolution(solution) {
        return this._towersTmp[this._boardSize][this._orderOption(solution, 'clockwise')];
    }

    _orderOption(solution, option) {
        switch (option) {
            case 'clockwise':
                return this._clockwise(solution);
            case 'ablr':
                return this._aboveBelowLeftRight(solution);
            default:
                return '';
        }
    }

    _aboveBelowLeftRight(solution) {
        return solution.substr(solution.length / 2) + solution.substr(0, solution.length / 2);
    }

    _clockwise(solution) {
        return this._reverseString(solution.substr(solution.length / 4 * 3)) + solution.substr(solution.length / 4, solution.length / 4) + solution.substr(0, solution.length / 4) + this._reverseString(solution.substr(solution.length / 2, solution.length / 4));
    }

    _reverseString(str) {
        return str.split('').reverse().join('');
    }

    isTower() {
        const numb = 5;
        const regex = '([1-' + numb + ']' + this._seperator + '){' + ((numb * 4) - 1) + '}[1-' + numb + ']';
        if (this._tower.match(new RegExp('[5]:' + regex)) !== null) {
            this._variableBoardSize = true;
            this._tower = this._tower.match(new RegExp('[5]:' + regex))[0];
            return true;
        } else if (this._tower.match(new RegExp(regex)) !== null) {
            this._tower = this._tower.match(new RegExp(regex))[0];
            return true;
        } else {
            return false;
        }
        // |([4]:([1-4]\/){15}[1-4])|([3]:([1-3]\/){11}[1-3])|([7]:([1-7]\/){27}[1-7])|([8]:([1-8]\/){31}[1-8])|([6]:([1-6]\/){23}[1-6])
    }

    solutions() {
        if (this.isTower()) {
            if (this._variableBoardSize)
                this._boardSize = parseInt(this._tower.substr(0, this._tower.indexOf(':')));
            const values = this._variableBoardSize ? this._tower.substr(this._tower.indexOf(":") + 1) : this._tower;
            const solutions = this._towerSolution(values.replace(new RegExp(this._seperator, 'g'), ''));
            let index = 1,
                str = '';
            if (solutions !== undefined) {
                solutions.forEach((board) => {
                    str += 'Solution ' + index + '\n\r';
                    board.forEach((row) => {
                        str += row.join(' ') + '\n\r';
                    });

                    if (index !== solutions.length) str += '\n\r';
                    index++;
                });

                return str;
            } else {
                return 'No solution found! You can use `@' + client.user.username + ' help` for how to use me.';
            }
        } else {
            return process.env.NO_CORRECT_BOARD_FOUND;
        }
    }

    _pN(n) {
        if (n === 1) {
            return [[1]];
        } else {
            const pNminus1 = this._pN(n - 1);
            const result = [];
            pNminus1.forEach((r) => {
                for (let i = 0; i < n; i++) {
                    const newArr = r.slice();
                    newArr.splice(i, 0, n);
                    result.push(newArr);
                }
            });
            return result;
        }
    }

    _generateBoard(row, n) {
        if (n === 1) {
            return row.map(p => [p]);
        } else {
            const boardNminus1 = this._generateBoard(row, n - 1);
            const result = [];
            boardNminus1.forEach((board) => {
                row.forEach((row) => {
                    const validBoard = [0, 1, 2, 3, 4].every((n) => {
                        return board.every((r) => r[n] !== row[n]);
                    });
                    if (validBoard) {
                        const newArr = board.slice();
                        newArr.push(row);
                        result.push(newArr);
                    }
                });
            });
            return result;
        }
    }

    _towerCount(row) {
        let maxHeight = 0;
        let count = 0;
        for (let i = 0; i < row.length; i++) {
            if (row[i] > maxHeight) {
                maxHeight = row[i];
                count++;
            }
        }
        return count;
    }

    _transpose(a) {
        return a[0].map((_, c) => a.map(r => r[c]));
    }
}

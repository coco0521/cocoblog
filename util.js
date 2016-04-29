//以16进制表示输出的值
exports.md5 = function(input) {
    return require('crypto').createHash('md5').update(input).digest('hex');
}

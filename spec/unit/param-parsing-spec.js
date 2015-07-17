var parser = require('../../lib/middleware/file_param').parser;
var httpMocks = require('node-mocks-http');

describe('the parameter parsing', function () {

    function assertParserResult() {
        var type = arguments.length == 2 ? '*' : arguments[0];
        var input = arguments.length == 2 ? arguments[0] : arguments[1];
        var expected = arguments.length == 2 ? arguments[1] : arguments[2];

        var request = httpMocks.createRequest({
            headers: {'Content-Type': type},
            body: input
        });
        var response = httpMocks.createResponse();
        expect(parser(request, response).value()).toEqual(expected);
    }

    it('transforms a simple file list to an array', function (done) {
        assertParserResult(
            "file1\nfile2\nfile3",
            [{file: 'file1'}, {file: 'file2'}, {file: 'file3'}]
        );
        done();
    });

    it('does not transform passed in arrays', function (done) {
        assertParserResult(
            ['file4', 'file5'],
            [{file: 'file4'}, {file: 'file5'}]
        );
        done();
    });

    it('filters out empty values in text arguments', function (done) {
        assertParserResult(
            "file7\n\nfile8\n",
            [{file: 'file7'}, {file: 'file8'}]
        );
        done();
    });

    it('filters out empty values in array arguments', function (done) {
        assertParserResult(
            ['file9', '', 'file10', ''],
            [{file: 'file9'}, {file: 'file10'}]
        );
        done();
    });

    it('transforms the extended file list to an array', function (done) {
        assertParserResult(
            'text/csv',
            "file1\tService[apache2]\nfile2\tExec[run]",
            [{file: 'file1', resource: 'Service[apache2]'}, {file: 'file2', resource: 'Exec[run]'}]
        );
        done();
    });
});

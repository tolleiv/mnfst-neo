var parser = require('../../lib/middleware/file_param').parser;
var httpMocks = require('node-mocks-http');

describe('the parameter parsing', function () {

    it('transforms a simple file list to an array', function (done) {
        var request = httpMocks.createRequest({
            body: "file1\nfile2\nfile3"
        });
        var response = httpMocks.createResponse();
        expect(parser(request, response).value()).toEqual([{file: 'file1'}, {file: 'file2'}, {file: 'file3'}]);
        done();
    });

    it('does not transform passed in arrays', function (done) {
        var request = httpMocks.createRequest({
            body: ['file4', 'file5']
        });
        var response = httpMocks.createResponse();
        expect(parser(request, response).value()).toEqual([{file: 'file4'}, {file: 'file5'}]);
        done();
    });

    it('filters out empty values in text arguments', function (done) {
        var request = httpMocks.createRequest({
            body: "file7\n\nfile8\n"
        });
        var response = httpMocks.createResponse();
        expect(parser(request, response).value()).toEqual([{file: 'file7'}, {file: 'file8'}]);
        done();
    });

    it('filters out empty values in array arguments', function (done) {
        var request = httpMocks.createRequest({
            body: ['file9', '', 'file10', '']
        });
        var response = httpMocks.createResponse();
        expect(parser(request, response).value()).toEqual([{file: 'file9'}, {file: 'file10'}]);
        done();
    });

    it('transforms the extended file list to an array', function (done) {
        var request = httpMocks.createRequest({
            headers: {'Content-Type': 'text/csv'},
            body: "file1\tService[apache2]\nfile2\tExec[run]"
        });
        var response = httpMocks.createResponse();

        var assumption = [{file: 'file1', resource: 'Service[apache2]'}, {file: 'file2', resource: 'Exec[run]'}];
        expect(parser(request, response).value()).toEqual(assumption);
        done();
    });
});

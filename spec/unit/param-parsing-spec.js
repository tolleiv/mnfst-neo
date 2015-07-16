var parser = require('../../lib/middleware/file_param').parser;
var httpMocks = require('node-mocks-http');

describe('the parameter parsing', function () {

    it('transforms a simple file list to an array', function (done) {
        var request = httpMocks.createRequest({
            body: "file1\nfile2\nfile3"
        });
        var response = httpMocks.createResponse();
        expect(parser(request, response).value()).toEqual(['file1', 'file2', 'file3']);
        done();
    });

    it('does not transform passed in arrays', function (done) {
        var request = httpMocks.createRequest({
            body: ['file4', 'file5']
        });
        var response = httpMocks.createResponse();
        expect(parser(request, response).value()).toEqual(['file4', 'file5']);
        done();
    });

    it('filters out empty values in text arguments', function (done) {
        var request = httpMocks.createRequest({
            body: "file7\n\nfile8\n"
        });
        var response = httpMocks.createResponse();
        expect(parser(request, response).value()).toEqual(['file7', 'file8']);
        done();
    });

    it('filters out empty values in array arguments', function (done) {
        var request = httpMocks.createRequest({
            body: ['file9', '', 'file10', '']
        });
        var response = httpMocks.createResponse();
        expect(parser(request, response).value()).toEqual(['file9', 'file10']);
        done();
    });
});

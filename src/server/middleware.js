function apiError(error, message) {
    console.error(error);
    this.status(500);
    this.json({
        error: message || 'Internal error'
    });
}

function badRequest(message) {
    console.log('Bad request', message);
    this.status(400);
    this.json({
        error: message || 'Bad request'
    });
}

function notFound(message) {
    console.log('404 Not found', message);
    this.status(404);
    this.json({
        error: message || 'Not found'
    });
}

module.exports = {
    api(req, res, next) {
        res.$apiError = apiError;
        res.$badRequest = badRequest;
        res.$notFound = notFound;
        next();
    }
};


class ApiError extends Error {
    constructor(
        statusCode ,
        message = "something went wrong",
        errors= [],
        stack =""  //A report that shows where in the code the error happened, helpful for developers when debugging.
    ){ 
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors
 
        if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}
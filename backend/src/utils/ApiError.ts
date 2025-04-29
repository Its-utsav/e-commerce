export default class ApiError extends Error {
    message: string;
    readonly statusCode: number;
    readonly success: boolean = false;
    readonly errorStack?: string;
    readonly error?: string = "Something went wrong";
    constructor(
        statusCode: number,
        message: string,
        error?: string,
        errorStack?: string
    ) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        Error.captureStackTrace(this, this.constructor);
        this.errorStack = errorStack;
        this.error = error;
    }
}

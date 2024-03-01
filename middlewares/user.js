const { isValidObjectId } = require("mongoose");
const { sendError } = require("../utils/helpers");

exports.isResetTokenValid = async (req, res, next) =>{
    const {token, id} = req.query;
    if(!token || !id) return sendError(res, "Invalid request")

    if(!isValidObjectId(id)) return sendError(res, "Invalid user")
}
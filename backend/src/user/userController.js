var userService = require('./userService.js');

var createUserControllerFn = async (req, res) =>
{
    try
    {
        console.log(req.body);
        var status = await userService.createUserDBService(req.body);
        console.log(status);

        if (status)
        {
            res.send({"status": true, "message": "User created successfully"});
        }
        else
        {
            res.send({"status": false, "message": "Error creating user"});
        }
    }
    catch(err)
    {
        console.log(err);
    }
}

var readUserControllerDataFn = async (req,res) => 
{
    var user = await userService.readUserDataService(req.params.id);
    res.send({"status": true, "data": user, "message": "User data received back"});
}

var readAllUserControllerDataFn = async (req,res) => 
{
    var user = await userService.readAllUserDataService();
    res.send({"status": true, "data": user, "message": "User data received back"});
}

var updateUserControllerFn = async (req, res) => 
{
    console.log(req.params.id);
    console.log(req.body);

    var result = await userService.updateUserDBService(req.params.id, req.body);

    if (result)
    {
        res.send({ "status": true, "message": "User updated" });
    }
    else
    {
        res.send({ "status": false, "message": "Update failed" });
    }
}

var deleteUserControllerFn = async(req, res) =>
{
    console.log(req.params.id);
    var result = await userService.removeUserDBService(req.params.id);
    if (result)
    {
        res.send({"status": true, "message": "User deleted"});
    }
    else
    {
        res.send({"status": false, "message": "Deletion failed"})
    }
}

var loginUserControllerFn = async(req, res) => 
{
    var result = null;
    try {
        result = await userService.loginUserDBService(req.body);
        if(result.status) 
        {
            //res.send({ "status": true, "message": result.msg});
            res.status(200).send({
                idToken: result.token,
            })
        }
        else
        {
            res.send({ "status": false, "message": error.msg});
        }
    } catch (error) {
        console.log(error);
        res.send({ "status": false, "message": error.msg});
    }
}



module.exports = { createUserControllerFn, readUserControllerDataFn, readAllUserControllerDataFn, updateUserControllerFn, deleteUserControllerFn, loginUserControllerFn };
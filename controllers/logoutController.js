const userDB = {
  users: require("../model/users.json"),
  setUsers: function (data) {
    this.users = data;
  },
};

const fsPromises = require('fs').promises;
const path = require('path');

const handleLogout = async (req, res) => {
  // On client, also delete the access token
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); // No content
  const refreshToken = cookies.jwt

  // Is refreshToken in db?
  const foundUser = userDB.users.find((person) => person.refreshToken === refreshToken);
  if (!foundUser){
    res.clearCookie('jwt',  {httpOnly: true, maxAge: 24 * 60 * 60 * 1000 })
    return res.sendStatus(204); // Forbidden
  } 
  // Delete refreshToken in DB (instead mongoDB , for tutorial use file system)
   const otherUsers = userDB.users.filter(person => person.refreshToken !== foundUser.refreshToken);
    // Saving refreshToken with current user
    const currentUser = {...foundUser, refreshToken: ''};
     userDB.setUsers([...otherUsers,currentUser]);
        await fsPromises.writeFile(
          path.join(__dirname, '..', 'model', 'users.json'),
          JSON.stringify(userDB.users)
        );
     res.clearCookie('jwt',  {httpOnly: true, sameSite: ' None' , secure: true }) // secure: true - only serves on https
     res.sendStatus(204);
};

module.exports = { handleLogout }

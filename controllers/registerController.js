const userDB = {
  users: require("../model/users.json"),
  setUsers: function (data) {
    this.users = data;
  },
};

const fsPromises = require("fs").promises;
const path = require("path");
const bcrypt = require("bcrypt");

const handleNewUser = async (req, res) => {
  const { user, pwd } = req.body;
  if (!user || !pwd)
    return res.status(400).json({ message: "Username and password are required." });

  // check for duplicate usernames in the db
  const duplicate = userDB.users.find((person) => person.username === user);
  if (duplicate) return res.sendStatus(409); // status code stands for Conflict

  try {
    // encrypt the password
    const hashedPwd = await bcrypt.hash(pwd, 10); // salt rounds 10 (recommended)
    // store the new user
    const newUser = { 
      "username": user, 
      "roles": {"User": 2001},
      "password": hashedPwd 
    };
    userDB.setUsers([...userDB.users, newUser]);
    await fsPromises.writeFile(
      path.join(__dirname, "..", "model", "users.json"),
      JSON.stringify(userDB.users)
    );
    console.log(userDB.users);
    res.status(201).json({ success: `New ueser ${user} created!` });
  } 
  catch (err) {
    res.status(500).json({ message: err.message }); // status - server error
  }
};

module.exports = {handleNewUser};
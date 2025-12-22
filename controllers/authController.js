const User = require('../model/User');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const handleLogin = async (req , res) =>{
    const { user, pwd } = req.body;
  if (!user || !pwd)
    return res.status(400).json({ message: "Username and password are required." });

  // Find user exists
  const foundUser = await User.findOne({ username: user}).exec();
  if(!foundUser) return res.sendStatus(401); // Unauthorized

  // Evaluate password
  const match = await bcrypt.compare(pwd, foundUser.password);
  if(match){
    const roles = Object.values(foundUser.roles);
    // create JWTs
    const accessToken = jwt.sign(
      {
        "UserInfo": {
          "username": foundUser.username,
          "roles": roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" } // normally 5 mins / 15 mins
    );
    const refreshToken = jwt.sign(
      {"username": foundUser.username},
      process.env.REFRESH_TOKEN_SECRET ,
      {expiresIn : '1d'} // 1 day
    );

    // Saving refreshToken with current user
    foundUser.refreshToken = refreshToken;
    const result = await foundUser.save();

    res.cookie('jwt', refreshToken, {httpOnly: true, sameSite: 'None', // secure:true, for thunder client testing
      maxAge: 24 * 60 * 60 * 1000 });
    res.json({accessToken});

  } else{
    res.sendStatus(401);
  }
}

module.exports = {handleLogin};
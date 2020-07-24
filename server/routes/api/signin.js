const User = require('../../models/Users');
// const User = require('../../models/UserSessions');
const UserSessions = require('../../models/UserSessions');


module.exports = (app) => {


    app.post('/api/account/signup',(req,res,next) => {
        const { body } = req;
        console.log(body);
        const {
            firstName,
            lastName,
            password
        } = body;

        let {
            email
        } = body;
        
        // console.log(req.body);

        if(!firstName) {
            res.json({
                success : false,
                message : "Error first name cannot be blank"
            });
        }
        if (!lastName) {
          res.json({
            success: false,
            message: "Error Last name cannot be blank"
          });
        }
        if (!email) {
          res.json({
            success: false,
            message: "Error email cannot be blank"
          });
        }
        if (!password) {
          res.json({
            success: false,
            message: "Error password cannot be blank"
          });
        }

        email =  email.toLowerCase();

        //steps
        //1. verify dont exist 
        //2. save

        User.find({
            email : email
        },(err,previousUser) => {
            if(err)
            {
                // res.json('Error: server error');
                res.json({
                  success: false,
                  message: "Error : Server error1"
                });
            } else if(previousUser.length > 0) {
                // res.json('Error : Account already exist');
                res.json({
                  success: false,
                  message: "Error : Account already exist"
                });
            }

            // save the new user

            const newUser  = new User();
            newUser.email = email;
            newUser.firstName = firstName;
            newUser.lastName = lastName;
            newUser.password = newUser.generateHash(password);
            console.log(newUser);
            newUser.save((err, user) => {
                if(err)
                {
                    console.log(err);
                    res.json({
                        success : false,
                        message : "Error : Server error2"
                    });
                }
                else {
                    res.json({
                      success: true,
                      message: "Signed Up!"
                    });
                }

            })

        });


    });

    app.post('/api/account/signin', (req, res, next) => {
          const {
            body
          } = req;
          const {
            password
          } = body;

          let {
            email
          } = body;

          if (!password) {
            res.json({
              success: false,
              message: "Error password cannot be blank"
            });
          }

          if (!email) {
            res.json({
              success: false,
              message: "Error Email cannot be blank"
            });
          }
          console.log(body);
          email = email.toLowerCase();

          User.find({email : email},(err,user) => {
            if(err)
            {
                 res.json({
                   success: false,
                   message: "Error : Server error3"
                 });
            } 
            if(user.length != 1)
            {
                res.json({
                  success: false,
                  message: "Error : Invalid"
                });
            }

            const users = user[0];
            if(!users.validPassword(password)) {
                res.json({
                  success: false,
                  message: "Error : Invalid password"
                });
            }

            //other wise create user session

            let userSession = new UserSessions();
            userSession.userId = users._id;
            // console.log(users._id);
            userSession.save((err,doc) => {
                 if (err) {
                    //  console.log(err);
                   res.json({
                     success: false,
                     message: "Error : Server error4"
                   });
                 }
                 else {
                     res.send({
                         success : true,
                         message : 'valid sign in',
                         token : doc._id
                     });
                 }
            });

          });

        

        });

    app.get('/api/account/verify', (req, res, next) => {
        const {query} = req;
        const {token} = query;

        // console.log(req);
        // console.log(token);
        UserSessions.find({_id : token , isDeleted : false} , (err,sessions) => {
            if(err)
            {
                res.json({
                  success: false,
                  message: "Error : Server error5"
                });
            }

            if(sessions.length != 1)
            {
                res.json({
                  success: false,
                  message: "Error : Invalid"
                });
            } else {
                res.json({
                  success: true,
                  message: "Good"
                });
            }


        } );

    });

    app.get('/api/account/logout',(req,res,next) => {
        const {query} = req;
        const {token} = query;

        // console.log(req);
        // console.log(token);
        UserSessions.findOneAndUpdate({_id : token , isDeleted : false} ,{$set :{isDeleted : true}}, {upsert : false, new : true} , (err,sessions) => {
            if(err)
            {
                res.json({
                  success: false,
                  message: "Error : Server error5"
                });
            }

           
             else {
                res.json({
                  success: true,
                  message: "Good"
                });
            }

        });
    });
};

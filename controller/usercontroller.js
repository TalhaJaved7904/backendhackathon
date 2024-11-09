const Usermodel = require("../model/usermodel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const UserController = {
    register: async (req, res) => {
        try {
            const { firstName, lastName, email, password, role } = req.body
            if (!firstName || !email || !password || !role || !lastName) {
                return res.status(400).json({
                    message: "Something is missing",
                    success: false
                });
            };
            const user = await Usermodel.findOne({ email })
            if (user) {
                return res.status(400).json({
                    message: "User already existed with this email",
                    success: false,
                })
            }
            const hashedPassword = await bcrypt.hash(password, 10);

            await Usermodel.create({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role,
            })

            return res.status(201).json({
                message: "Account created successfully",
                success: true
            })
        } catch (error) {
            console.log(error)
        }
    },

    login: async (req, res) => {
        try {
            const { email, password, role } = req.body
            if (!email || !password || !role) {
                return res.status(400).json({
                    message: "Something is missing",
                    success: false
                });
            };
            let user = await Usermodel.findOne({ email })
            if (!user) {
                return res.status(400).json({
                    message: "Incorrect email or password",
                    success: false,
                })
            }
            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if (!isPasswordMatch) {
                return res.status(400).json({
                    message: "Incorrect email or password",
                    success: false
                });
            }

            if (role != user.role) {
                return res.status(400).json({
                    message: "Account doesn't available with current role",
                    success: false
                })
            };

            const tokenData = {
                userId: user.id
            }
            const token = await jwt.sign(tokenData, process.env.SECURITY_KEY, { expiresIn: '1d' })

            user = {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                profile: user.profile
            }

            return res.status(200)
                .cookie("tokenData", token,
                    {
                        maxAge: 24 * 60 * 60 * 1000,
                        httpOnly: true,
                        sameSite: 'strict'
                    })
                .json({
                    message: `Welcome back ${user.firstName}`,
                    user,
                    success: true
                })
        } catch (error) {
            console.log(error)
        }
    },

    logout: async (req, res) => {
        try {
            return res.status(200).cookie("token", "", { maxAge: 0 }).json({
                message: "Logged out Successfully",
                success: true
            })
        } catch (error) {
            console.log(error)
        }
    },

    updateProfile: async (req, res) => {
        try {
            const { firstName, lastName, email, bio, skills } = req.body;
            const file = req.file

            console.log("Received bio:", bio);
            console.log("Received skills:", skills)
            let skillsArray = Array.isArray(req.body.skills)
                ? req.body.skills
                : req.body.skills?.split(",") || [];
            const userId = req.id;
            let user = await Usermodel.findById(userId);
            if (!user) {
                return res.status(400).json({
                    message: "User not found",
                    success: false
                })
            }

            if (firstName) user.firstName = firstName
            if (lastName) user.lastName = lastName
            if (email) user.email = email
            if (bio) user.profile.bio = bio
            if (skillsArray) user.profile.skills = skillsArray

            await user.save()

            user = {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                profile: user.profile
            }

            return res.status(200).json({
                message: "Profile Updated Successfully",
                user,
                success: true,
            })

        } catch (error) {
            console.log(error)
        }
    },
    getAll: async (req, res) => {
        try {
            let result = await Usermodel.find({})
            res.status(200).send({
                isSuccessfull: true,
                data: result,
                message: "Data fetched successfully",
            })
        } catch (error) {
            res.status(500).send({
                isSuccessfull: false,
                data: error,
                message: "Internal Server Error",
                error: error.message,
            })
        }
    },

    getById: async (req, res) => {
        try {
            let id = req.params.id
            let result = await Usermodel.findById(id)
            res.status(200).send({
                isSuccessfull: true,
                data: result,
                message: "Data fetched successfully",
            })
        } catch (error) {
            res.status(500).send({
                isSuccessfull: false,
                data: null,
                message: "No data found for this ID",
                error: error.message,
            });
        }

    },
    del: (req, res) => {
        try {
            let id = req.params.id;
            Usermodel.findByIdAndDelete(id)
                .then((result) => {
                    res.status(200).send({
                        isSuccessfull: true,
                        data: null,
                        message: "User deleted successfully",
                    })
                })
                .catch((err) => {
                    res.status(500).send({
                        isSuccessfull: false,
                        data: null,
                        message: "Internal Server Error",
                        error: err.message,
                    })
                });
        } catch (error) {
            res.status(500).send({
                isSuccessfull: false,
                data: error,
                message: "Internal Server Error",
                error: error.message,
            });
        }
    },
}

module.exports = UserController
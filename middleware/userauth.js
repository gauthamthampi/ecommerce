const uscollec = require("../models/userconfig");
const checkUserBlocked = async (req, res, next) => {
    try {
        const user = await uscollec.findOne({email:req.session.user});
        if (user && user.isBlocked === 'Blocked') {
            // req.session.destroy((err) => {
            //     if (err) {
            //         console.error('Error destroying session:', err);
            //     }
                req.session.user = false;
                res.redirect('/login?message=blocked');

        } else {
            next();
        }
    } catch (error) {
        console.error('Error checking user blocked status:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = checkUserBlocked;
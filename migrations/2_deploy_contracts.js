const CourseRegistration = artifacts.require("CourseRegistration");

module.exports = function (deployer) {
    const courseFee = web3.utils.toWei('0.1', 'ether');
    deployer.deploy(CourseRegistration, courseFee);
};

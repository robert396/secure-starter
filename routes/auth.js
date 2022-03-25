const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { Octokit } = require('@octokit/core');

//const jwtRequired = passport.authenticate('jwt', { session: false });

const router = express.Router();

router.get('/', passport.authenticate('github', { scope: ['user:email', 'read:user', 'read:org']}), (req, res) => res.redirect('/'));

router.get('/callback', (req, res, next) => {
  passport.authenticate('github', async (err, user) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.redirect('/');
    }

    const octokit = new Octokit({ auth: user.accessToken });
    const getTeamsQuery = await octokit.graphql(
      `query ($login: String!, $user: String!) {
        organization(login: $login) {
          teams(first: 100, userLogins: [$user]) {
            totalCount
            edges {
              node {
                name
              }
            }
          }
        } 
      }`, { login: process.env.GITHUB_ORG, user: user.profile.username }
    );

    const userReturnObject = { 
      username: user.profile.username,
      email: user.profile._json.email,
      avatar: user.profile._json.avatar_url,
      teams: getTeamsQuery.organization.teams.edges.map(edge => edge.node.name)
    };

    req.session.accessToken = user.accessToken;
    req.session.jwt = jwt.sign(userReturnObject, process.env.JWT_SECRET_KEY);
    return res.redirect('/');
  })(req, res, next);
});

router.get('/current-session', (req, res) => {
  passport.authenticate('jwt', { session: false}, (err, user) => {
    if (err || !user) {
      return res.send(false);
    } else {
      return res.send(user);
    }
  })(req, res);
});

router.get('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});

module.exports = router;
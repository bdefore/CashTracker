module.exports = class Auth

  fs = require 'fs'
  conf = require './conf'
  express = require 'express'
  mongoose = require 'mongoose'

  mongoose.connect conf.database

  UserSchema = new mongoose.Schema {
    name        : String
    fbId        : Number
  }
  mongoose.model 'User', UserSchema
  User = mongoose.model 'User'

  usersByFbId = {}
  usersById = {}
  nextUserId = 0

  addUser = (source, sourceUser) ->

    if arguments.length == 1
      user = sourceUser = source
      user.id = ++nextUserId
      return usersById[nextUserId] = user
    else
      user = usersById[++nextUserId] = { id: nextUserId }
      user[source] = sourceUser

    console.log '-> addUser: adding user of id: ' + user.id
    return user

  getStoredUser = (id, callback) ->
    User.findOne { fbId: id }, (error, result) ->
      if error
        console.log "Error getting user: " + error

      if !callback
        console.log "Warning: user requested without callback"

      else callback result

  @bootEveryAuth: (app) ->

    everyauth = require 'everyauth'

    # everyauth requires this override in order to store
    # local version of facebook user data
    everyauth.everymodule.findUserById (userId, callback) ->
      User.findOne userId, callback
      # callback null, { userId: userId }

    # Create callback that will store user to db
    facebookResponseCallback = (session, token, extra, fbUserMetadata) ->

      console.log "Checking to see if we have FB user: " + fbUserMetadata.id
      console.log fbUserMetadata

      getStoredUser fbUserMetadata.id, (result) ->
        if !result
          console.log "Is new user record"
          u = new User
            name:   fbUserMetadata.name
            fbId:   fbUserMetadata.id
          u.save()
        else
          console.log "Stored user record found"

      # Check if this user has already been added to our list of users
      # If not, add. Then return this user
      userByFbId = usersByFbId[fbUserMetadata.id]
      if !userByFbId
        userByFbId = usersByFbId[fbUserMetadata.id] = \
          addUser 'facebook', fbUserMetadata

      return userByFbId

    # TO FIX: Find more elegant way of complying with line length
    # than making daisychain variables and \ char. #toolazytoreaddocs
    daisyChain = everyauth \
      .facebook \
      .appId(conf.fb.appId) \
      .appSecret(conf.fb.appSecret) \
      .findOrCreateUser facebookResponseCallback

    # TO FIX: If this could be appeneded to previous call, daisyChain
    # variable is unnecessary
    daisyChain.redirectPath conf.domain + "/account"

    # Link everyauth to express, in order to access user object in view
    # templates
    app.use everyauth.middleware()
    everyauth.helpExpress app
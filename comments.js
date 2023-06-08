// Create web server

// Import modules
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

// Import models
const Comment = require('../models/Comment');
const User = require('../models/User');
const Post = require('../models/Post');

// Import middleware
const auth = require('../middleware/auth');

// @route   POST api/comments
// @desc    Create a comment
// @access  Private
router.post(
    '/',
    [
        auth,
        [
            check('text', 'Text is required').not().isEmpty(),
            check('post', 'Post is required').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        // Check for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        } else {
            // Destructure request
            const { text, post } = req.body;

            try {
                // Create new comment
                const newComment = new Comment({
                    text,
                    post,
                    user: req.user.id,
                });

                // Save comment
                const comment = await newComment.save();

                // Find post
                const foundPost = await Post.findById(post);

                // Add comment to post
                foundPost.comments.unshift(comment);

                // Save post
                await foundPost.save();

                // Find user
                const foundUser = await User.findById(req.user.id);

                // Add comment to user
                foundUser.comments.unshift(comment);

                // Save user
                await foundUser.save();

                // Return comment
                res.json(comment);
            } catch (err) {
                console.error(err.message);
                res.status(500).send('Server error');
            }
        }
    }
);
    
const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')

const Confession = require('../models/Confession')

// @desc    Show add page
// @route   GET /confessions/add
router.get('/add', ensureAuth, (req, res) => {
    res.render('confessions/add')
})

// @desc    Process add form
// @route   POST /confessions
router.post('/', ensureAuth, async (req, res) => {
    try {
        req.body.user = req.user.id
        await Confession.create(req.body)
        res.redirect('/dashboard')
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

// @desc    Show all confessions
// @route   GET /confessions
router.get('/', ensureAuth, async (req, res) => {
    try {
        const confessions = await Confession.find({ status: 'public' })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean()

        res.render('confessions/index', {
            confessions,
        })
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

// @desc    Show single confession
// @route   GET /confessions/:id
router.get('/:id', ensureAuth, async (req, res) => {
    try {
        let confession = await Confession.findById(req.params.id)
            .populate('user')
            .lean()

        if (!confession) {
            return res.render('error/404')
        }

        res.render('confessions/show', {
            confession
        })
    } catch (err) {
        console.error(err)
        return res.render('error/404')
    }
})

// @desc    Show edit page
// @route   GET /confessions/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
    try {
        const confession = await Confession.findOne({
            _id: req.params.id
        }).lean()
    
        if (!confession) {
            return res.render('error/404')
        }
    
        if (confession.user != req.user.id) {
            res.redirect('/confessions')
        } else {
            res.render('confessions/edit', {
                confession
            })
        }
    } catch (err) {
        console.error(err)
        return res.render('error/500')
    }
})

// @desc    Update confession
// @route   PUT /confessions/:id
router.put('/:id', ensureAuth, async (req, res) => {
    try {
        let confession = await Confession.findById(req.params.id).lean()

        if (!confession) {
            return res.render('error/404')
        }

        if (confession.user != req.user.id) {
            res.redirect('/confessions')
        } else {
            confession = await Confession.findOneAndUpdate({ _id: req.params.id }, req.body, {
                new: true,
                runValidators: true
            })

            res.redirect('/dashboard')
        }
    } catch (err) {
        console.error(err)
        return res.render('error/500')
    }
})

// @desc    Delete confession
// @route   DELETE /confessions/:id
router.delete('/:id', ensureAuth, async (req, res) => {
    try {
        await Confession.remove({ _id: req.params.id })
        res.redirect('/dashboard')
    } catch (err) {
        console.error(err)
        return res.render('error/500')
    }
})

// @desc    User confessions
// @route   GET /confessions/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
    try {
        const confessions = await Confession.find({
            user: req.params.userId,
            status: 'public'
        })
        .populate('user')
        .lean()

        res.render('confessions/index', {
            confessions
        })
    } catch (err) {
        console.error(err)
        return res.render('error/500')
    }
})

module.exports = router
const express = require('express');
const router = express.Router();
const pool = require('../db/postgres');

// POST /api/subscribe
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate email
    if (!email) {
      return res.status(400).json({ 
        success: false,
        error: 'Email is required' 
      });
    }
    
    // Basic email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        error: 'Please provide a valid email address' 
      });
    }
    
    try {
      // Check if email already exists
      const existingResult = await pool.query(
        'SELECT * FROM subscribers WHERE email = $1',
        [email.toLowerCase()]
      );
      
      if (existingResult.rows.length > 0) {
        const subscriber = existingResult.rows[0];
        
        if (subscriber.is_active) {
          return res.status(409).json({ 
            success: false,
            error: 'This email is already subscribed' 
          });
        } else {
          // Reactivate subscription
          await pool.query(
            'UPDATE subscribers SET is_active = true WHERE email = $1',
            [email.toLowerCase()]
          );
          
          return res.json({ 
            success: true,
            message: 'Welcome back! Your subscription has been reactivated.',
            email: email.toLowerCase()
          });
        }
      }
      
      // Insert new subscriber
      const result = await pool.query(
        'INSERT INTO subscribers (email) VALUES ($1) RETURNING *',
        [email.toLowerCase()]
      );
      
      res.status(201).json({ 
        success: true,
        message: 'Successfully subscribed to crypto insights!',
        email: result.rows[0].email 
      });
      
    } catch (dbError) {
      // PostgreSQL unique constraint violation
      if (dbError.code === '23505') {
        return res.status(409).json({ 
          success: false,
          error: 'This email is already subscribed' 
        });
      }
      throw dbError;
    }
    
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to process subscription',
      message: error.message 
    });
  }
});

// DELETE /api/unsubscribe
router.delete('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false,
        error: 'Email is required' 
      });
    }
    
    const result = await pool.query(
      'UPDATE subscribers SET is_active = false WHERE email = $1 RETURNING *',
      [email.toLowerCase()]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Email not found in our subscription list' 
      });
    }
    
    res.json({ 
      success: true,
      message: 'Successfully unsubscribed from crypto insights' 
    });
    
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to process unsubscription',
      message: error.message 
    });
  }
});

module.exports = router;
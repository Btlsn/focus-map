import express from 'express';
import { createSoapClient } from '../utils/soapClient';

const router = express.Router();

router.get('/:workspaceId/comments', async (req, res) => {
  try {
    const client = await createSoapClient();
    const result = await new Promise((resolve, reject) => {
      client.getWorkplaceComments({
        workspaceId: req.params.workspaceId
      }, (err: any, result: any) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    
    if (result && result.comments) {
      res.json(result.comments);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('SOAP error:', error);
    res.status(500).json({ error: 'Yorumlar alınamadı' });
  }
});

router.post('/:workspaceId/comments', async (req, res) => {
  try {
    const client = await createSoapClient();
    const result = await new Promise((resolve, reject) => {
      client.addComment({
        workspaceId: req.params.workspaceId,
        userId: req.body.userId,
        content: req.body.content
      }, (err: any, result: any) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    
    if (result && result.comment) {
      res.json(result.comment);
    } else {
      throw new Error('Comment could not be added');
    }
  } catch (error) {
    console.error('SOAP error:', error);
    res.status(500).json({ error: 'Yorum eklenemedi' });
  }
});

export default router; 
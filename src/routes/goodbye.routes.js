import { Router } from 'express'
import { getGoodbye } from '../controllers/goodbye.controller'

const router = Router()

router.get('/', getGoodbye)

export default router
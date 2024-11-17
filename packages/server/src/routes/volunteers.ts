import express, { Response, NextFunction } from 'express';
import { supabase } from '../index';
import { validate } from '../middleware/validation';
import { volunteerSchema } from '../schemas';
import { catchAsync } from '../utils/errors';
import { AuthenticatedRequest, ApiResponse, Volunteer, VolunteerAvailability } from '../types';

const router = express.Router();

/**
 * @swagger
 * /api/volunteers:
 *   get:
 *     tags: [Volunteers]
 *     summary: Get all volunteers for the organization
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, pending]
 *         description: Filter by volunteer status
 *       - in: query
 *         name: skill
 *         schema:
 *           type: string
 *         description: Filter by specific skill
 *     responses:
 *       200:
 *         description: List of volunteers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       first_name:
 *                         type: string
 *                       last_name:
 *                         type: string
 *                       email:
 *                         type: string
 *                         format: email
 *                       phone:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [active, inactive, pending]
 *                       skills:
 *                         type: array
 *                         items:
 *                           type: string
 *                       availability:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             day:
 *                               type: string
 *                               enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *                             start_time:
 *                               type: string
 *                             end_time:
 *                               type: string
 *                       notes:
 *                         type: string
 *                       organization_id:
 *                         type: string
 *                         format: uuid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal Server Error
 */
// Get all volunteers for an organization
router.get('/', catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const organization_id = req.user?.organization_id;

  const { data, error } = await supabase
    .from('volunteers')
    .select('*')
    .eq('organization_id', organization_id);

  if (error) throw error;

  const response: ApiResponse<Volunteer[]> = {
    success: true,
    data: data as Volunteer[] || []
  };

  res.json(response);
}));

/**
 * @swagger
 * /api/volunteers/{id}:
 *   get:
 *     tags: [Volunteers]
 *     summary: Get volunteer by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Volunteer ID
 *     responses:
 *       200:
 *         description: Volunteer details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     phone:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [active, inactive, pending]
 *                     skills:
 *                       type: array
 *                       items:
 *                         type: string
 *                     availability:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           day:
 *                             type: string
 *                             enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *                           start_time:
 *                             type: string
 *                           end_time:
 *                             type: string
 *                     notes:
 *                       type: string
 *                     organization_id:
 *                       type: string
 *                       format: uuid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Volunteer not found
 *       500:
 *         description: Internal Server Error
 */
// Get a specific volunteer
router.get('/:id', catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const organization_id = req.user?.organization_id;

  const { data, error } = await supabase
    .from('volunteers')
    .select('*')
    .eq('organization_id', organization_id)
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!data) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Volunteer not found'
    };
    res.status(404).json(response);
    return;
  }

  const response: ApiResponse<Volunteer> = {
    success: true,
    data: data as Volunteer
  };

  res.json(response);
}));

/**
 * @swagger
 * /api/volunteers:
 *   post:
 *     tags: [Volunteers]
 *     summary: Create a new volunteer
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *               - phone
 *               - status
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, pending]
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               availability:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     day:
 *                       type: string
 *                       enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *                     start_time:
 *                       type: string
 *                     end_time:
 *                       type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Volunteer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     phone:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [active, inactive, pending]
 *                     skills:
 *                       type: array
 *                       items:
 *                         type: string
 *                     availability:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           day:
 *                             type: string
 *                             enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *                           start_time:
 *                             type: string
 *                           end_time:
 *                             type: string
 *                     notes:
 *                       type: string
 *                     organization_id:
 *                       type: string
 *                       format: uuid
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal Server Error
 */
// Create a new volunteer
router.post('/', validate(volunteerSchema), catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const newVolunteer: Partial<Volunteer> = {
    ...req.body,
    organization_id: req.user!.organization_id,
    status: 'active',
  };

  const { data, error } = await supabase
    .from('volunteers')
    .insert([newVolunteer])
    .select()
    .single();

  if (error) throw error;

  const response: ApiResponse<Volunteer> = {
    success: true,
    data: data as Volunteer,
    message: 'Volunteer created successfully'
  };

  res.status(201).json(response);
}));

/**
 * @swagger
 * /api/volunteers/{id}:
 *   put:
 *     tags: [Volunteers]
 *     summary: Update a volunteer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Volunteer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *               - phone
 *               - status
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, pending]
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               availability:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     day:
 *                       type: string
 *                       enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *                     start_time:
 *                       type: string
 *                     end_time:
 *                       type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Volunteer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     phone:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [active, inactive, pending]
 *                     skills:
 *                       type: array
 *                       items:
 *                         type: string
 *                     availability:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           day:
 *                             type: string
 *                             enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *                           start_time:
 *                             type: string
 *                           end_time:
 *                             type: string
 *                     notes:
 *                       type: string
 *                     organization_id:
 *                       type: string
 *                       format: uuid
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Volunteer not found
 *       500:
 *         description: Internal Server Error
 */
// Update a volunteer
router.put('/:id', validate(volunteerSchema), catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const organization_id = req.user!.organization_id;
  const updates = req.body;

  const { data, error } = await supabase
    .from('volunteers')
    .update(updates)
    .eq('organization_id', organization_id)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  if (!data) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Volunteer not found'
    };
    res.status(404).json(response);
    return;
  }

  const response: ApiResponse<Volunteer> = {
    success: true,
    data: data as Volunteer,
    message: 'Volunteer updated successfully'
  };

  res.json(response);
}));

/**
 * @swagger
 * /api/volunteers/{id}:
 *   delete:
 *     tags: [Volunteers]
 *     summary: Delete a volunteer (soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Volunteer ID
 *     responses:
 *       200:
 *         description: Volunteer deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Volunteer not found
 *       500:
 *         description: Internal Server Error
 */
// Delete a volunteer (soft delete by setting status to inactive)
router.delete('/:id', catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const organization_id = req.user!.organization_id;

  const { data, error } = await supabase
    .from('volunteers')
    .update({ status: 'inactive' })
    .eq('organization_id', organization_id)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  if (!data) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Volunteer not found'
    };
    res.status(404).json(response);
    return;
  }

  const response: ApiResponse<null> = {
    success: true,
    message: 'Volunteer deactivated successfully'
  };

  res.status(200).json(response);
}));

/**
 * @swagger
 * /api/volunteers/{id}/availability:
 *   get:
 *     tags: [Volunteers]
 *     summary: Get volunteer availability
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Volunteer ID
 *     responses:
 *       200:
 *         description: Volunteer availability
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       day:
 *                         type: string
 *                         enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *                       start_time:
 *                         type: string
 *                       end_time:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Volunteer not found
 *       500:
 *         description: Internal Server Error
 */
// Get volunteer availability
router.get('/:id/availability', catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const organization_id = req.user!.organization_id;

  const { data, error } = await supabase
    .from('volunteers')
    .select('availability')
    .eq('organization_id', organization_id)
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!data) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Volunteer not found'
    };
    res.status(404).json(response);
    return;
  }

  const response: ApiResponse<VolunteerAvailability[]> = {
    success: true,
    data: data.availability || []
  };

  res.json(response);
}));

/**
 * @swagger
 * /api/volunteers/{id}/availability:
 *   put:
 *     tags: [Volunteers]
 *     summary: Update volunteer availability
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Volunteer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 day:
 *                   type: string
 *                   enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *                 start_time:
 *                   type: string
 *                 end_time:
 *                   type: string
 *     responses:
 *       200:
 *         description: Volunteer availability updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     phone:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [active, inactive, pending]
 *                     skills:
 *                       type: array
 *                       items:
 *                         type: string
 *                     availability:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           day:
 *                             type: string
 *                             enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *                           start_time:
 *                             type: string
 *                           end_time:
 *                             type: string
 *                     notes:
 *                       type: string
 *                     organization_id:
 *                       type: string
 *                       format: uuid
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Volunteer not found
 *       500:
 *         description: Internal Server Error
 */
// Update volunteer availability
router.put('/:id/availability', catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const organization_id = req.user!.organization_id;
  const { availability } = req.body;

  const { data, error } = await supabase
    .from('volunteers')
    .update({ availability })
    .eq('organization_id', organization_id)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  if (!data) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Volunteer not found'
    };
    res.status(404).json(response);
    return;
  }

  const response: ApiResponse<Volunteer> = {
    success: true,
    data: data as Volunteer,
    message: 'Volunteer availability updated successfully'
  };

  res.json(response);
}));

export default router;

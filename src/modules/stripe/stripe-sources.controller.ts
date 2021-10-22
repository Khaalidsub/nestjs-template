import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import Stripe from 'stripe';
import { CursorPipe } from '../../pipes/cursor.pipe';
import { OptionalIntPipe } from '../../pipes/optional-int.pipe';
import { AuditLog } from '../audit-logs/audit-log.decorator';
import { Scopes } from '../auth/scope.decorator';
import { StripeService } from './stripe.service';

@Controller('groups/:groupId/sources')
export class StripeSourcesController {
  constructor(private stripeService: StripeService) {}

  /** Create a source for a group */
  @Post()
  @AuditLog('write-source')
  @Scopes('group-{groupId}:write-source-*')
  async create(
    @Param('groupId', ParseIntPipe) groupId: number,
  ): Promise<Stripe.Checkout.Session> {
    return this.stripeService.createSession(groupId, 'setup');
  }

  /** Read sources for a group */
  @Get()
  @Scopes('group-{groupId}:read-source-*')
  async getAll(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query('take', OptionalIntPipe) take?: number,
    @Query('cursor', CursorPipe) cursor?: { id: string },
  ): Promise<Stripe.CustomerSource[]> {
    return this.stripeService.getSources(groupId, { take, cursor });
  }

  /** Read a source for a group */
  @Get(':id')
  @Scopes('group-{groupId}:read-source-{id}')
  async get(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('id') id: string,
  ): Promise<Stripe.Source> {
    return this.stripeService.getSource(groupId, id);
  }

  /** Delete a source for a group */
  @Delete(':id')
  @AuditLog('delete-source')
  @Scopes('group-{groupId}:delete-source-{id}')
  async remove(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('id') id: string,
  ): Promise<{ success: true }> {
    await this.stripeService.deleteSource(groupId, id);
    return { success: true };
  }
}

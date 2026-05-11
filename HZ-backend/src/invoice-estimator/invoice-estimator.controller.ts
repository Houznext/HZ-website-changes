import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CreateInvoiceEstimatorDto,
  InvoiceFilterDto,
  UpdateInvoiceEstimatorDto,
} from './dto/invoice-estimator.dto';
import { InvoiceEstimator } from './entities/invoice-estimator.entity';
import { InvoiceEstimatorService } from './invoice-estimator.service';
import { ControllerAuthGuard, RequestUser } from 'src/guard';

@ApiTags('invoice-estimator')
@ApiBearerAuth()
@Controller('invoice-estimator')
export class InvoiceEstimatorController {
  constructor(
    private readonly invoiceEstimatorService: InvoiceEstimatorService,
  ) { }

  @UseGuards(ControllerAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new invoice estimator' })
  @ApiResponse({
    status: 201,
    description: 'The invoice estimator has been successfully created.',
    type: InvoiceEstimator,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async create(
    @Body() createInvoiceEstimatorDto: CreateInvoiceEstimatorDto,
    @Req() req: { user: RequestUser },
  ): Promise<InvoiceEstimator> {
    return this.invoiceEstimatorService.create(
      createInvoiceEstimatorDto,
      req.user,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'List invoice estimators with filters + pagination',
  })
  async findAll(
    @Query() query: InvoiceFilterDto,
  ) {
    const {
      branchId,
      billToName,
      billToCity,
      shipToCity,
      invoiceNumber,
      invoiceDate,
      invoiceDue,
      invoiceTerms,
      page = 1,
      limit = 10,
    } = query;

    return this.invoiceEstimatorService.findAll(
      branchId,
      billToName,
      billToCity,
      shipToCity,
      invoiceNumber,
      invoiceDate,
      invoiceDue,
      invoiceTerms,
      page,
      limit,
    );
  }

  @Get('/custom-builder/:id')
  @ApiOperation({ summary: 'Get invoice estimators by CustomBuilder ID' })
  @ApiResponse({
    status: 200,
    description: 'Return invoice estimators for the custom builder.',
    type: [InvoiceEstimator],
  })
  @ApiResponse({ status: 404, description: 'Invoice estimator not found.' })
  findForCustomBuilder(@Param('id') id: string) {
    return this.invoiceEstimatorService.findByCustomBuilderId(id);
  }

  @Get('by-mobile/:mobile')
  findByMobile(@Param('mobile') mobile: string) {
    return this.invoiceEstimatorService.findByCustomerMobile(mobile);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an invoice estimator by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the invoice estimator.',
    type: InvoiceEstimator,
  })
  @ApiResponse({ status: 404, description: 'Invoice estimator not found.' })
  async findById(
    @Param('id') id: string,
  ): Promise<InvoiceEstimator> {
    return this.invoiceEstimatorService.findById(id);
  }

  @Get('send-email/:email')
  @ApiOperation({ summary: 'Send invoice email to user' })
  @ApiResponse({
    status: 200,
    description: 'The invoice email has been successfully sent.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async sendEmail(@Param('email') email: string): Promise<void> {
    return this.invoiceEstimatorService.sendEmail(email);
  }

  @Get('non-registered/by-admin/:userId')
  async getNonRegisteredInvoicesByAdmin(
    @Req() req: { user: RequestUser },
    @Param('userId') userId: string,
    @Query() query: InvoiceFilterDto,
  ) {
    const currentUser = req.user;
    const {
      branchId,
      billToName,
      billToCity,
      shipToCity,
      invoiceNumber,
      invoiceDate,
      invoiceDue,
      invoiceTerms,
      page = 1,
      limit = 10,
    } = query;

    return this.invoiceEstimatorService.findInvoicesForNonExistingUsers(
      currentUser,
      {
        billToName,
        billToCity,
        shipToCity,
        invoiceNumber,
        invoiceDate,
        invoiceDue,
        invoiceTerms,
      },
      page,
      limit,
      branchId,
      userId,
    );
  }

  @UseGuards(ControllerAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Update an invoice estimator by ID' })
  @ApiResponse({
    status: 200,
    description: 'The invoice estimator has been successfully updated.',
    type: InvoiceEstimator,
  })
  @ApiResponse({ status: 404, description: 'Invoice estimator not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateInvoiceEstimatorDto: UpdateInvoiceEstimatorDto,
  ): Promise<InvoiceEstimator> {
    return this.invoiceEstimatorService.update(id, updateInvoiceEstimatorDto);
  }

  @UseGuards(ControllerAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an invoice estimator by ID' })
  @ApiResponse({
    status: 200,
    description: 'The invoice estimator has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Invoice estimator not found.' })
  async delete(
    @Param('id') id: string,
    @Req() req: { user: RequestUser },
  ): Promise<void> {
    return this.invoiceEstimatorService.delete(id, req.user);
  }
}

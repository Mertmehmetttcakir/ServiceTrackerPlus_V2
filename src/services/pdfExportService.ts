import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  CustomerReport,
  FinancialReport,
  ServiceReport,
  TechnicianReport
} from '../types/reports';

export class PDFExportService {
  private static setupFont(doc: jsPDF) {
    // Using standard fonts for better compatibility
    doc.setFont('helvetica', 'normal');
  }

  private static addHeader(doc: jsPDF, title: string) {
    // Font setup
    this.setupFont(doc);
    
    // Logo area
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ServiceTracker Plus', 20, 25);
    
    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(title, 20, 40);
    
    // Date
    doc.setFontSize(10);
    doc.text(`Report Date: ${new Date().toLocaleDateString('en-US')}`, 20, 50);
    
    // Line
    doc.setLineWidth(0.5);
    doc.line(20, 55, 190, 55);
    
    return 65; // Content start position
  }

  private static addFooter(doc: jsPDF) {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.setFont('helvetica', 'normal');
    
    // Page number
    const currentPage = doc.internal.pages.length - 1;
    doc.text(`Page ${currentPage}`, 20, pageHeight - 20);
    
    doc.text(
      'ServiceTracker Plus - Automotive Service Management System',
      105,
      pageHeight - 20,
      { align: 'center' }
    );
  }

  static async exportFinancialReport(report: FinancialReport): Promise<void> {
    const doc = new jsPDF();
    this.setupFont(doc);
    let yPosition = this.addHeader(doc, 'Financial Report');

    // Summary information
    const summaryData = [
      ['Total Revenue', `$${report.totalRevenue.toLocaleString('en-US')}`],
      ['Total Expenses', `$${report.totalExpenses.toLocaleString('en-US')}`],
      ['Net Profit', `$${report.netProfit.toLocaleString('en-US')}`],
      ['Pending Payments', `$${report.pendingAmount.toLocaleString('en-US')}`],
      ['Paid Amount', `$${report.paidAmount.toLocaleString('en-US')}`],
      ['Refund Amount', `$${report.refundAmount.toLocaleString('en-US')}`],
      ['Profit Margin', `${report.profitMargin.toFixed(2)}%`],
      ['Revenue Growth', `${report.revenueGrowth.toFixed(2)}%`],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: summaryData,
      styles: { 
        fontSize: 10,
        font: 'helvetica',
        fontStyle: 'normal'
      },
      headStyles: { 
        fillColor: [49, 130, 206],
        font: 'helvetica',
        fontStyle: 'bold'
      },
      margin: { left: 20, right: 20 },
    });

    this.addFooter(doc);
    doc.save(`financial-report-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  static async exportCustomerReport(report: CustomerReport): Promise<void> {
    const doc = new jsPDF();
    this.setupFont(doc);
    let yPosition = this.addHeader(doc, 'Customer Report');

    // Summary information
    const summaryData = [
      ['Total Customers', report.totalCustomers.toString()],
      ['New Customers', report.newCustomers.toString()],
      ['Returning Customers', report.returningCustomers.toString()],
      ['Customer Retention Rate', `${report.customerRetentionRate.toFixed(2)}%`],
      ['Average Customer Value', `$${report.averageCustomerValue.toLocaleString('en-US')}`],
      ['Customer Growth', `${report.customerGrowth.toFixed(2)}%`],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: summaryData,
      styles: { 
        fontSize: 10,
        font: 'helvetica',
        fontStyle: 'normal'
      },
      headStyles: { 
        fillColor: [49, 130, 206],
        font: 'helvetica',
        fontStyle: 'bold'
      },
      margin: { left: 20, right: 20 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // Top customers
    if (report.topCustomers && report.topCustomers.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Top Customers', 20, yPosition);
      yPosition += 10;

      const topCustomersData = report.topCustomers.map(customer => [
        customer.name,
        customer.jobCount.toString(),
        `$${customer.totalSpent.toLocaleString('en-US')}`
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Customer Name', 'Job Count', 'Total Spent']],
        body: topCustomersData,
        styles: { 
          fontSize: 9,
          font: 'helvetica',
          fontStyle: 'normal'
        },
        headStyles: { 
          fillColor: [49, 130, 206],
          font: 'helvetica',
          fontStyle: 'bold'
        },
        margin: { left: 20, right: 20 },
      });
    }

    this.addFooter(doc);
    doc.save(`customer-report-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  static async exportServiceReport(report: ServiceReport): Promise<void> {
    const doc = new jsPDF();
    this.setupFont(doc);
    let yPosition = this.addHeader(doc, 'Service Report');

    // Summary information
    const summaryData = [
      ['Total Jobs', report.totalJobs.toString()],
      ['Completed Jobs', report.completedJobs.toString()],
      ['Pending Jobs', report.pendingJobs.toString()],
      ['Cancelled Jobs', report.cancelledJobs.toString()],
      ['Average Job Value', `$${report.averageJobValue.toLocaleString('en-US')}`],
      ['Average Completion Time', `${report.averageCompletionTime.toFixed(1)} days`],
      ['Job Growth', `${report.jobGrowth.toFixed(2)}%`],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: summaryData,
      styles: { 
        fontSize: 10,
        font: 'helvetica',
        fontStyle: 'normal'
      },
      headStyles: { 
        fillColor: [49, 130, 206],
        font: 'helvetica',
        fontStyle: 'bold'
      },
      margin: { left: 20, right: 20 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // Popular services
    if (report.popularServices && report.popularServices.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Popular Services', 20, yPosition);
      yPosition += 10;

      const servicesData = report.popularServices.map(service => [
        service.service,
        service.count.toString(),
        `$${service.revenue.toLocaleString('en-US')}`
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Service Name', 'Count', 'Total Revenue']],
        body: servicesData,
        styles: { 
          fontSize: 9,
          font: 'helvetica',
          fontStyle: 'normal'
        },
        headStyles: { 
          fillColor: [49, 130, 206],
          font: 'helvetica',
          fontStyle: 'bold'
        },
        margin: { left: 20, right: 20 },
      });
    }

    this.addFooter(doc);
    doc.save(`service-report-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  static async exportTechnicianReport(report: TechnicianReport): Promise<void> {
    const doc = new jsPDF();
    this.setupFont(doc);
    let yPosition = this.addHeader(doc, 'Technician Report');

    // Summary information
    const summaryData = [
      ['Total Technicians', report.totalTechnicians.toString()],
      ['Active Technicians', report.activeTechnicians.toString()],
      ['Average Jobs/Day', report.productivity.averageJobsPerDay.toFixed(1)],
      ['Average Revenue/Technician', `$${report.productivity.averageRevenuePerTechnician.toLocaleString('en-US')}`],
      ['Total Work Hours', `${report.productivity.totalWorkHours.toFixed(1)} hours`],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: summaryData,
      styles: { 
        fontSize: 10,
        font: 'helvetica',
        fontStyle: 'normal'
      },
      headStyles: { 
        fillColor: [49, 130, 206],
        font: 'helvetica',
        fontStyle: 'bold'
      },
      margin: { left: 20, right: 20 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // Technician performance
    if (report.workload && report.workload.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Technician Performance', 20, yPosition);
      yPosition += 10;

      const performanceData = report.workload.map(tech => [
        tech.name,
        tech.completedJobs.toString(),
        `$${tech.totalRevenue.toLocaleString('en-US')}`,
        `${tech.averageRating.toFixed(1)}/5`,
        `${tech.efficiency.toFixed(1)}%`
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Technician', 'Job Count', 'Total Revenue', 'Average Rating', 'Efficiency']],
        body: performanceData,
        styles: { 
          fontSize: 9,
          font: 'helvetica',
          fontStyle: 'normal'
        },
        headStyles: { 
          fillColor: [49, 130, 206],
          font: 'helvetica',
          fontStyle: 'bold'
        },
        margin: { left: 20, right: 20 },
      });
    }

    this.addFooter(doc);
    doc.save(`technician-report-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  static async exportCombinedReport(
    financial: FinancialReport,
    customer: CustomerReport,
    service: ServiceReport,
    technician: TechnicianReport
  ): Promise<void> {
    const doc = new jsPDF();
    this.setupFont(doc);
    let yPosition = this.addHeader(doc, 'Comprehensive Business Report');

    // Financial summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Financial Summary', 20, yPosition);
    yPosition += 10;

    const financialData = [
      ['Net Profit', `$${financial.netProfit.toLocaleString('en-US')}`],
      ['Total Revenue', `$${financial.totalRevenue.toLocaleString('en-US')}`],
      ['Pending Payments', `$${financial.pendingAmount.toLocaleString('en-US')}`],
      ['Profit Margin', `${financial.profitMargin.toFixed(2)}%`],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: financialData,
      styles: { 
        fontSize: 10,
        font: 'helvetica',
        fontStyle: 'normal'
      },
      headStyles: { 
        fillColor: [49, 130, 206],
        font: 'helvetica',
        fontStyle: 'bold'
      },
      margin: { left: 20, right: 20 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Customer summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Summary', 20, yPosition);
    yPosition += 10;

    const customerData = [
      ['Total Customers', customer.totalCustomers.toString()],
      ['New Customers', customer.newCustomers.toString()],
      ['Customer Retention Rate', `${customer.customerRetentionRate.toFixed(2)}%`],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: customerData,
      styles: { 
        fontSize: 10,
        font: 'helvetica',
        fontStyle: 'normal'
      },
      headStyles: { 
        fillColor: [49, 130, 206],
        font: 'helvetica',
        fontStyle: 'bold'
      },
      margin: { left: 20, right: 20 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Service summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Service Summary', 20, yPosition);
    yPosition += 10;

    const serviceData = [
      ['Total Jobs', service.totalJobs.toString()],
      ['Completed Jobs', service.completedJobs.toString()],
      ['Job Growth', `${service.jobGrowth.toFixed(2)}%`],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: serviceData,
      styles: { 
        fontSize: 10,
        font: 'helvetica',
        fontStyle: 'normal'
      },
      headStyles: { 
        fillColor: [49, 130, 206],
        font: 'helvetica',
        fontStyle: 'bold'
      },
      margin: { left: 20, right: 20 },
    });

    this.addFooter(doc);
    doc.save(`comprehensive-report-${new Date().toISOString().split('T')[0]}.pdf`);
  }
} 
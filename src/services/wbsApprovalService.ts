import { GeneratedWBS } from './wbsGenerationService';

export interface WBSApprovalRequest {
  id: string;
  wbsId: string;
  wbsTitle: string;
  totalHours: number;
  totalEstimatedValue?: number;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  approvals: WBSApproval[];
  comments?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface WBSApproval {
  id: string;
  type: 'technical' | 'finance' | 'legal' | 'management';
  status: 'pending' | 'approved' | 'rejected';
  approverName?: string;
  approverEmail?: string;
  approvedAt?: string;
  comments?: string;
  required: boolean;
}

export interface ApprovalRule {
  type: 'technical' | 'finance' | 'legal' | 'management';
  required: boolean;
  threshold?: {
    hours?: number;
    value?: number;
  };
  description: string;
}

// Default approval rules based on WBS complexity and size
const DEFAULT_APPROVAL_RULES: ApprovalRule[] = [
  {
    type: 'technical',
    required: true,
    description: 'Technical review required for all WBS submissions'
  },
  {
    type: 'finance',
    required: true,
    threshold: { hours: 200 },
    description: 'Financial approval required for projects over 200 hours'
  },
  {
    type: 'legal',
    required: false,
    threshold: { hours: 500 },
    description: 'Legal review required for large projects over 500 hours'
  },
  {
    type: 'management',
    required: false,
    threshold: { hours: 1000 },
    description: 'Management approval required for enterprise projects over 1000 hours'
  }
];

class WBSApprovalService {
  private readonly STORAGE_KEY = 'wbs_approval_requests';
  
  /**
   * Submit WBS for approval
   */
  async submitForApproval(wbs: GeneratedWBS, requestedBy: string, comments?: string): Promise<WBSApprovalRequest> {
    try {
      // Generate unique ID for the approval request
      const requestId = `wbs-approval-${Date.now()}`;
      
      // Determine required approvals based on WBS size and complexity
      const requiredApprovals = this.determineRequiredApprovals(wbs);
      
      // Create approval request
      const approvalRequest: WBSApprovalRequest = {
        id: requestId,
        wbsId: `wbs-${Date.now()}`,
        wbsTitle: wbs.title,
        totalHours: wbs.totalEstimate.hours,
        totalEstimatedValue: this.estimateProjectValue(wbs.totalEstimate.hours),
        requestedBy,
        requestedAt: new Date().toISOString(),
        status: 'pending',
        approvals: requiredApprovals,
        comments,
        priority: this.determinePriority(wbs.totalEstimate.hours),
        dueDate: this.calculateDueDate()
      };
      
      // Store the approval request
      await this.saveApprovalRequest(approvalRequest);
      
      // Store the WBS data separately
      localStorage.setItem(`wbs_data_${approvalRequest.wbsId}`, JSON.stringify(wbs));
      
      console.log('WBS submitted for approval:', approvalRequest);
      return approvalRequest;
      
    } catch (error) {
      console.error('Failed to submit WBS for approval:', error);
      throw new Error('Failed to submit WBS for approval');
    }
  }
  
  /**
   * Get all pending approval requests
   */
  async getPendingApprovals(): Promise<WBSApprovalRequest[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const requests: WBSApprovalRequest[] = JSON.parse(stored);
      return requests.filter(r => r.status === 'pending' || r.status === 'under_review');
    } catch (error) {
      console.error('Failed to get pending approvals:', error);
      return [];
    }
  }
  
  /**
   * Get approval request by ID
   */
  async getApprovalRequest(requestId: string): Promise<WBSApprovalRequest | null> {
    try {
      const requests = await this.getAllApprovalRequests();
      return requests.find(r => r.id === requestId) || null;
    } catch (error) {
      console.error('Failed to get approval request:', error);
      return null;
    }
  }
  
  /**
   * Update approval status
   */
  async updateApproval(
    requestId: string, 
    approvalType: string, 
    status: 'approved' | 'rejected',
    approverName: string,
    comments?: string
  ): Promise<void> {
    try {
      const requests = await this.getAllApprovalRequests();
      const requestIndex = requests.findIndex(r => r.id === requestId);
      
      if (requestIndex === -1) {
        throw new Error('Approval request not found');
      }
      
      const request = requests[requestIndex];
      const approvalIndex = request.approvals.findIndex(a => a.type === approvalType);
      
      if (approvalIndex === -1) {
        throw new Error('Approval type not found');
      }
      
      // Update the specific approval
      request.approvals[approvalIndex] = {
        ...request.approvals[approvalIndex],
        status,
        approverName,
        approvedAt: new Date().toISOString(),
        comments
      };
      
      // Check if all required approvals are complete
      const requiredApprovals = request.approvals.filter(a => a.required);
      const completedApprovals = requiredApprovals.filter(a => a.status !== 'pending');
      const rejectedApprovals = requiredApprovals.filter(a => a.status === 'rejected');
      
      // Update overall request status
      if (rejectedApprovals.length > 0) {
        request.status = 'rejected';
      } else if (completedApprovals.length === requiredApprovals.length) {
        const allApproved = requiredApprovals.every(a => a.status === 'approved');
        request.status = allApproved ? 'approved' : 'rejected';
      } else {
        request.status = 'under_review';
      }
      
      // Save updated requests
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(requests));
      
    } catch (error) {
      console.error('Failed to update approval:', error);
      throw error;
    }
  }
  
  /**
   * Get WBS data for an approval request
   */
  async getWBSData(wbsId: string): Promise<GeneratedWBS | null> {
    try {
      const stored = localStorage.getItem(`wbs_data_${wbsId}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to get WBS data:', error);
      return null;
    }
  }
  
  /**
   * Get all approval requests (including completed)
   */
  private async getAllApprovalRequests(): Promise<WBSApprovalRequest[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get all approval requests:', error);
      return [];
    }
  }
  
  /**
   * Save approval request to storage
   */
  private async saveApprovalRequest(request: WBSApprovalRequest): Promise<void> {
    try {
      const existingRequests = await this.getAllApprovalRequests();
      existingRequests.push(request);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingRequests));
    } catch (error) {
      console.error('Failed to save approval request:', error);
      throw error;
    }
  }
  
  /**
   * Determine required approvals based on WBS characteristics
   */
  private determineRequiredApprovals(wbs: GeneratedWBS): WBSApproval[] {
    const approvals: WBSApproval[] = [];
    const totalHours = wbs.totalEstimate.hours;
    
    DEFAULT_APPROVAL_RULES.forEach(rule => {
      let isRequired = rule.required;
      
      // Check threshold requirements
      if (rule.threshold) {
        if (rule.threshold.hours && totalHours >= rule.threshold.hours) {
          isRequired = true;
        }
      }
      
      if (isRequired || rule.required) {
        approvals.push({
          id: `${rule.type}-${Date.now()}`,
          type: rule.type,
          status: 'pending',
          required: isRequired,
        });
      }
    });
    
    return approvals;
  }
  
  /**
   * Estimate project value based on hours
   */
  private estimateProjectValue(hours: number): number {
    const hourlyRate = 150; // Default hourly rate
    return hours * hourlyRate;
  }
  
  /**
   * Determine priority based on project size
   */
  private determinePriority(hours: number): 'low' | 'medium' | 'high' {
    if (hours > 1000) return 'high';
    if (hours > 400) return 'medium';
    return 'low';
  }
  
  /**
   * Calculate due date (7 business days from now)
   */
  private calculateDueDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString();
  }
}

// Export singleton instance
export const wbsApprovalService = new WBSApprovalService();
export default wbsApprovalService;

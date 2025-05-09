
import { supabase } from "@/integrations/supabase/client";
import faceDetectionService from "./FaceDetectionService";

export interface Member {
  id?: string;
  name: string;
  email?: string;
  face_encoding?: any;
  status?: string;
  photo_url?: string;
  created_at?: string;  // Add created_at property to match the database schema
  updated_at?: string;  // Add updated_at for completeness
}

class MemberService {
  async createMember(member: Member): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase
      .from('members')
      .insert([member])
      .select()
      .single();
    
    return { data, error };
  }

  async updateMemberFaceEncoding(id: string, face_encoding: any): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase
      .from('members')
      .update({ face_encoding })
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  }

  async uploadMemberPhoto(id: string, file: File): Promise<{ data: any; error: any }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${id}.${fileExt}`;
    const filePath = `${id}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('member_photos')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });
    
    if (error) return { data: null, error };
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('member_photos')
      .getPublicUrl(filePath);
    
    return { data: { path: filePath, url: publicUrl }, error: null };
  }

  async getAllMembers(): Promise<{ data: Member[]; error: any }> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('name');
    
    return { data: data || [], error };
  }

  async getMemberById(id: string): Promise<{ data: Member | null; error: any }> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();
    
    return { data, error };
  }

  async recordAttendance(memberId: string): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase
      .from('attendance')
      .insert([{ member_id: memberId }])
      .select();
    
    return { data, error };
  }

  async getRecentAttendance(limit = 10): Promise<{ data: any[]; error: any }> {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        member:members(name)
      `)
      .order('check_in_time', { ascending: false })
      .limit(limit);
    
    return { data: data || [], error };
  }

  async getMemberAttendance(memberId: string): Promise<{ data: any[]; error: any }> {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('member_id', memberId)
      .order('check_in_time', { ascending: false });
    
    return { data: data || [], error };
  }

  async getDailyAttendanceCount(): Promise<{ data: number; error: any }> {
    // Get today's date in ISO format with timezone
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
    
    const { count, error } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .gte('check_in_time', startOfDay)
      .lte('check_in_time', endOfDay);
    
    return { data: count || 0, error };
  }

  // New method to get recognition metrics
  async getRecognitionMetrics(): Promise<{ data: any; error: any }> {
    try {
      // Get total members
      const { data: members, error: membersError } = await this.getAllMembers();
      if (membersError) throw new Error(membersError.message);
      
      // Get members with face encoding
      const membersWithFaces = members.filter(m => m.face_encoding);
      
      // Get today's attendance
      const { data: todayCount, error: countError } = await this.getDailyAttendanceCount();
      if (countError) throw new Error(countError.message);
      
      // Calculate metrics
      const metrics = {
        totalMembers: members.length,
        registeredFaces: membersWithFaces.length,
        registrationRate: members.length > 0 ? membersWithFaces.length / members.length : 0,
        todayAttendance: todayCount
      };
      
      return { data: metrics, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

export const memberService = new MemberService();
export default memberService;

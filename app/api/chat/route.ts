import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is missing');
      return NextResponse.json({ error: 'System not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      tools: [{ googleSearch: {} }],
      systemInstruction: 'Bạn là Thổ địa FTU, một anh/chị khóa trên học trường Đại học Ngoại Thương (FTU) Hà Nội. Tính cách của bạn dí dỏm, nhiệt tình, hay dùng ngôn ngữ gen Z và từ lóng của sinh viên Ngoại Thương (như chạy deadline, tạch môn, qua môn, cháy phố Chùa Láng). Bạn có nhiệm vụ tư vấn học tập, địa điểm ăn uống quanh khu Chùa Láng, và hoạt động câu lạc bộ cho các em khóa dưới. Luôn trả lời ngắn gọn, thân thiện.'
    });

    const result = await model.generateContent(message);
    const responseText = result.response.text();

    return NextResponse.json({ reply: responseText });
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Minimize2, Maximize2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../contexts/ThemeContext';

const AIAssistant = ({ setActiveTab, openModal }) => {
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const messagesEndRef = useRef(null);
  const { colors } = useTheme();

  const { leads, aircraft, deals, tasks } = useStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages, isAiThinking]);

  const handleAiMessage = async () => {
    if (!aiInput.trim()) return;

    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      const errorMessage = {
        role: 'assistant',
        content: 'AI Assistant is not configured. Please add VITE_GEMINI_API_KEY to your .env file to enable AI responses.'
      };
      setAiMessages(prev => [...prev, errorMessage]);
      return;
    }

    const currentInput = aiInput;
    const userMessage = { role: 'user', content: currentInput };
    setAiMessages(prev => [...prev, userMessage]);
    setIsAiThinking(true);
    setAiInput('');

    try {
      // Prepare context about current CRM state
      const crmContext = {
        leads: leads.map(l => ({
          id: l.id,
          name: l.name,
          company: l.company,
          status: l.status,
          aircraftType: l.aircraftType,
          budget: l.budget,
          budgetKnown: l.budgetKnown,
          presentations: l.presentations?.length || 0
        })),
        aircraft: aircraft.map(a => ({
          id: a.id,
          manufacturer: a.manufacturer,
          model: a.model,
          year: a.year,
          serialNumber: a.serialNumber,
          price: a.price,
          presented: a.presentations?.length || 0
        })),
        deals: deals.map(d => ({
          id: d.id,
          dealName: d.dealName,
          clientName: d.clientName,
          status: d.status,
          dealValue: d.dealValue,
          estimatedClosing: d.estimatedClosing
        })),
        tasks: tasks.map(t => ({
          id: t.id,
          title: t.title,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate
        }))
      };

      const stats = {
        totalLeads: leads.length,
        inquiryLeads: leads.filter(l => l.status === 'Inquiry').length,
        presentedLeads: leads.filter(l => l.status === 'Presented').length,
        interestedLeads: leads.filter(l => l.status === 'Interested').length,
        totalAircraft: aircraft.length,
        unpresentedAircraft: aircraft.filter(a => !a.presentations || a.presentations.length === 0).length,
        totalDeals: deals.length,
        activeDeals: deals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.status)).length,
        totalTasks: tasks.length,
        pendingTasks: tasks.filter(t => t.status === 'pending').length,
        overdueTasks: tasks.filter(t => t.status === 'pending' && t.dueDate && new Date(t.dueDate) < new Date()).length
      };

      // Build conversation history for context
      const conversationHistory = aiMessages.slice(-6).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const systemPrompt = `You are an expert AI assistant for AeroBrokerOne, a private jet brokerage CRM system. You help aircraft brokers manage their business efficiently.

Current CRM Statistics:
• Leads: ${stats.totalLeads} total (${stats.inquiryLeads} inquiry, ${stats.presentedLeads} presented, ${stats.interestedLeads} interested)
• Aircraft: ${stats.totalAircraft} total (${stats.unpresentedAircraft} not yet presented to any leads)
• Deals: ${stats.totalDeals} total (${stats.activeDeals} active)
• Tasks: ${stats.totalTasks} total (${stats.pendingTasks} pending, ${stats.overdueTasks} overdue)

You have access to:
1. Full lead details (names, companies, statuses, preferences)
2. Aircraft inventory (manufacturer, model, year, price)
3. Deal pipeline (status, values, closing dates)
4. Task list (pending, overdue, priorities)

You can suggest actions like:
• "OPEN_LEADS" - Switch to leads view
• "OPEN_AIRCRAFT" - Switch to aircraft view
• "OPEN_DEALS" - Switch to deals view
• "OPEN_TASKS" - Switch to tasks view
• "CREATE_LEAD" - Open lead creation form
• "CREATE_AIRCRAFT" - Open aircraft creation form
• "CREATE_DEAL" - Open deal creation form
• "CREATE_TASK" - Open task creation form

When suggesting actions, include them at the end of your response on a new line starting with "ACTION:" followed by the action name.

Provide insightful, actionable advice based on the data. Be concise but helpful. Reference specific leads, aircraft, or deals by name when relevant.`;

      const userPromptWithContext = `${currentInput}

Available Data Summary:
${JSON.stringify(stats, null, 2)}

${crmContext.leads.length > 0 ? `\nRecent Leads: ${JSON.stringify(crmContext.leads.slice(0, 5), null, 2)}` : ''}
${crmContext.aircraft.length > 0 ? `\nAircraft Inventory: ${JSON.stringify(crmContext.aircraft.slice(0, 5), null, 2)}` : ''}
${crmContext.deals.length > 0 ? `\nActive Deals: ${JSON.stringify(crmContext.deals.slice(0, 5), null, 2)}` : ''}
${stats.pendingTasks > 0 ? `\nPending Tasks: ${JSON.stringify(crmContext.tasks.filter(t => t.status === 'pending').slice(0, 5), null, 2)}` : ''}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: systemPrompt }]
            },
            ...conversationHistory,
            {
              role: 'user',
              parts: [{ text: userPromptWithContext }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      let aiResponse = data.candidates[0]?.content?.parts[0]?.text || 'Sorry, I could not generate a response.';

      // Check for action suggestions
      let action = null;
      const actionMatch = aiResponse.match(/ACTION:\s*(\w+)/);
      if (actionMatch) {
        const actionName = actionMatch[1];
        aiResponse = aiResponse.replace(/ACTION:\s*\w+/g, '').trim();

        // Map actions to functions
        switch (actionName) {
          case 'OPEN_LEADS':
            action = () => setActiveTab('leads');
            break;
          case 'OPEN_AIRCRAFT':
            action = () => setActiveTab('aircraft');
            break;
          case 'OPEN_DEALS':
            action = () => setActiveTab('deals');
            break;
          case 'OPEN_TASKS':
            action = () => setActiveTab('tasks');
            break;
          case 'CREATE_LEAD':
            action = () => openModal('lead');
            break;
          case 'CREATE_AIRCRAFT':
            action = () => openModal('aircraft');
            break;
          case 'CREATE_DEAL':
            action = () => openModal('deal');
            break;
          case 'CREATE_TASK':
            action = () => openModal('task');
            break;
        }
      }

      const assistantMessage = { role: 'assistant', content: aiResponse };
      setAiMessages(prev => [...prev, assistantMessage]);

      if (action) {
        setTimeout(action, 500);
      }

    } catch (error) {
      console.error('AI Assistant error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.'
      };
      setAiMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAiThinking(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 lg:bottom-6 lg:right-6 z-40">
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="rounded-full p-3 lg:p-4 shadow-2xl hover:scale-110 transition-transform"
          style={{ backgroundColor: colors.primary }}
          title="Open AI Assistant"
        >
          <Bot size={24} className="lg:w-7 lg:h-7" />
        </button>
      ) : (
        <div className="rounded-lg shadow-2xl w-80 lg:w-96 max-h-[500px] lg:max-h-[600px] flex flex-col" style={{ backgroundColor: colors.cardBg }}>
          <div className="p-4 rounded-t-lg flex justify-between items-center" style={{ backgroundColor: colors.primary }}>
            <div className="flex items-center gap-2" style={{ color: colors.secondary }}>
              <Bot size={24} />
              <span className="font-semibold">AI Assistant</span>
            </div>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 rounded transition-colors"
              style={{ color: colors.secondary }}
              title="Minimize"
            >
              <Minimize2 size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-3 max-h-[350px] lg:max-h-[400px]">
            {aiMessages.length === 0 ? (
              <div className="text-center py-8" style={{ color: colors.textSecondary }}>
                <Bot size={48} className="mx-auto mb-3" style={{ color: colors.border }} />
                <p>Hi! I'm your AI assistant powered by Gemini.</p>
                <p className="text-sm mt-2">Ask me anything about your leads, aircraft, deals, or tasks!</p>
                <p className="text-xs mt-4 italic">I can analyze your data, provide insights, and help you take action.</p>
              </div>
            ) : (
              <>
                {aiMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'ml-8'
                        : 'mr-8'
                    }`}
                    style={{
                      backgroundColor: msg.role === 'user' ? colors.primary : colors.secondary,
                      color: msg.role === 'user' ? colors.secondary : colors.textPrimary
                    }}
                  >
                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
            {isAiThinking && (
              <div className="flex items-center gap-2 p-3" style={{ color: colors.textSecondary }}>
                <div className="animate-pulse">●</div>
                <div className="animate-pulse" style={{ animationDelay: '0.2s' }}>●</div>
                <div className="animate-pulse" style={{ animationDelay: '0.4s' }}>●</div>
              </div>
            )}
          </div>

          <div className="p-4" style={{ borderTop: `1px solid ${colors.border}` }}>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAiMessage()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 rounded-lg focus:outline-none"
                style={{
                  backgroundColor: colors.secondary,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.border}`
                }}
              />
              <button
                onClick={handleAiMessage}
                className="p-2 rounded-lg font-semibold"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.secondary,
                  opacity: isAiThinking || !aiInput.trim() ? 0.5 : 1
                }}
                disabled={isAiThinking || !aiInput.trim()}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
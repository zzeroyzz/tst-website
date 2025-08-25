import { GraphQLError } from 'graphql';
import { subDays, format } from 'date-fns';

interface Context {
  supabase: any;
  user: any;
  session: any;
}

export const statsResolvers = {
  Query: {
    messageStats: async (_: any, __: any, { supabase }: Context) => {
      try {
        // Get overall stats
        const { data: stats, error: statsError } = await supabase
          .from('crm_message_stats')
          .select('*')
          .single();

        if (statsError) {
          throw new GraphQLError(
            `Failed to fetch message stats: ${statsError.message}`
          );
        }

        // Get daily stats for the last 7 days
        const dailyStats: any[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = subDays(new Date(), i);
          const dateStr = format(date, 'yyyy-MM-dd');

          const { data: dailyData, error: dailyError } = await supabase
            .from('crm_messages')
            .select('direction, message_status')
            .gte('created_at', `${dateStr} 00:00:00`)
            .lt(
              'created_at',
              `${format(new Date(date.getTime() + 86400000), 'yyyy-MM-dd')} 00:00:00`
            );

          if (dailyError) {
            console.error('Error fetching daily stats:', dailyError);
            continue;
          }

          const sent =
            dailyData?.filter(
              m =>
                m.direction === 'OUTBOUND' &&
                ['SENT', 'DELIVERED'].includes(m.message_status)
            ).length || 0;
          const received =
            dailyData?.filter(m => m.direction === 'INBOUND').length || 0;
          const delivered =
            dailyData?.filter(
              m =>
                m.direction === 'OUTBOUND' && m.message_status === 'DELIVERED'
            ).length || 0;

          dailyStats.push({
            date: dateStr,
            sent,
            received,
            delivered,
          });
        }

        // Calculate response rate
        const { data: responseData, error: responseError } = await supabase
          .from('crm_messages')
          .select('contact_id, direction, created_at')
          .order('contact_id, created_at');

        let responseRate = 0;
        if (!responseError && responseData) {
          // Group by contact and calculate response rate
          const contactMessages = responseData.reduce((acc, msg) => {
            if (!acc[msg.contact_id]) acc[msg.contact_id] = [];
            acc[msg.contact_id].push(msg);
            return acc;
          }, {});

          let totalOutbound = 0;
          let responsesReceived = 0;

          Object.values(contactMessages).forEach((messages: any) => {
            for (let i = 0; i < messages.length; i++) {
              const msg = messages[i];
              if (msg.direction === 'OUTBOUND') {
                totalOutbound++;
                // Check if there's an inbound message within 24 hours
                const nextMsg = messages[i + 1];
                if (nextMsg && nextMsg.direction === 'INBOUND') {
                  const timeDiff =
                    new Date(nextMsg.created_at).getTime() -
                    new Date(msg.created_at).getTime();
                  if (timeDiff <= 24 * 60 * 60 * 1000) {
                    // 24 hours
                    responsesReceived++;
                  }
                }
              }
            }
          });

          responseRate =
            totalOutbound > 0 ? (responsesReceived / totalOutbound) * 100 : 0;
        }

        return {
          ...stats,
          responseRate,
          dailyStats,
        };
      } catch (error) {
        throw new GraphQLError(`Error fetching message stats: ${error}`);
      }
    },
  },
};

# USE THIS FILE TO EASILY DEFINE ALL OF YOUR CRON JOBS.
#
# It's helpful, but not entirely necessary to understand cron before proceeding.
# http://en.wikipedia.org/wiki/Cron
#
# ==============================================================================

# WHENEVER DOCUMENTATION
#
# Learn more: http://github.com/javan/whenever
#
# ==============================================================================

# EXECUTE WHENEVER LIKE THIS.
#
# cd cron && whenever --load-file schedule.rb -w
#
# ==============================================================================

set :output, { :error => 'log/cron.error.log', :standard => 'log/cron.log' }
env :PATH, "$PATH:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games"
set :path, "/data/crowdvoice/current"

# download imap attachments
every 5.minutes do
  command "cd #{@path} && GEM_HOME=/home/deploy/.bundler RAILS_ENV=#{@environment} thor imap:download"
end

# Deliver digest mail
every 1.days, :at => '12:00 am' do
  #command "cd #{@path} && GEM_HOME=/home/deploy/.bundler RAILS_ENV=#{@environment} thor subscriptions:digest"
  command "cd #{@path} && GEM_HOME=/home/deploy/.bundler RAILS_ENV=#{@environment} thor post:clear_cache_files"
  command "cd #{@path} && rm public/about.html && public/index.html"
end

# Fetch RSS feed
every 1.hours do
  command "cd #{@path} && GEM_HOME=/home/deploy/.bundler RAILS_ENV=#{@environment} thor voices:update_feed_voices"
end

# Fetch RSS feed
every 12.hours do
  command "cd #{@path} && GEM_HOME=/home/deploy/.bundler RAILS_ENV=#{@environment} thor voices:update_installation_feed_voices"
end


# Remove old image previews
every 1.day do
  command "cd #{@path} && find ./public/tmp -mtime +1 -exec rm {} \;"
end

# Remove unapproved posts
# if @environment == "production"
#   every 1.day do
#     command "cd #{@path} && GEM_HOME=/home/deploy/.bundler RAILS_ENV=#{@environment} bundle exec rake cleaning"
#   end
# end
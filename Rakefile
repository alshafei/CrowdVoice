# Add your own tasks in files placed in lib/tasks ending in .rake,
# for example lib/tasks/capistrano.rake, and they will automatically be available to Rake.

require File.expand_path('../config/application', __FILE__)
require 'rake'

CrowdvoiceV2::Application.load_tasks

desc "Recreate post images"
task :recreate_images => :environment do
  logger = Logger.new("/data/crowdvoice/shared/log/recreate_versions.log")

  Voice.all.each do |voice|
    voice.posts.find_each do |post|
      begin
        post.image.recreate_versions! unless post.image.url == "https://s3.amazonaws.com/crowdvoice-production-bucket/link-default.png"
        logger.info "Success voice(#{voice.id}) post(#{post.id})"
      rescue => e
        logger.info "Failed voice(#{voice.id}) post(#{post.id}): #{e.inspect}"
      end
    end
  end
end

desc "Fetch tweets for voices"
task :fetch_tweets => :environment do
  voices = Voice.where(["last_tweet < ? OR last_twitter_error IS NOT null", 1.hour.ago])

  voices.each do |voice|
    voice.tweets.first() ? last_tweet = voice.tweets.first().id_str : last_tweet = nil
    
    if !voice.twitter_search.blank?
      puts "\n\n"
      puts "Last: #{last_tweet} in Voice #{voice.id}"
      puts "Search term: #{voice.twitter_search}"

      term = voice.twitter_search
      if term[term.length - 3, term.length] == " OR"
        term = term[0, term - 3]
      end

      if term[term.length - 4, term.length] == " OR "
        term = term[0, term.length - 4]
      end

      if term[term.length - 4, term.length] == " AND"
        term = term[0, term.length - 4]
      end

      begin
        results = Twitter.search(term, {:since_id => last_tweet, :count => 20}).results
        puts "\n"
        puts "Processing #{results.length} results"
        results.each do |result|
          tweet           = Tweet.new
          tweet[:id_str]  = result[:id]
          tweet[:text]    = result[:full_text]
          tweet[:voice_id]   = voice.id
          tweet.save

          urls = TwitterSearch.extract_tweet_urls(tweet)
          urls.each do |url|
            resolved_url = TwitterSearch.resolve_redirects(url)
            puts "Saving #{resolved_url}"

            voice.posts.new(:source_url => url).save
          end
        end

        voice.last_tweet         = term
        voice.last_twitter_error = nil

        puts "#{results.length} processed on Voice #{voice.id}"  
      rescue Exception => e
        voice.last_twitter_error = e
        puts "Error #{e}"
      end
      
    else
      puts "Skiping Voice #{voice.id}"
    end

    voice.last_tweet = DateTime.now
    voice.save
  end
end



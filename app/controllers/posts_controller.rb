class PostsController < ApplicationController
  before_filter :find_voice
  respond_to :json, :only => [:create]
  respond_to :html, :only => [:show]

  cache_sweeper :posts_sweeper, :only => [:create, :update, :destroy]

  def create
    @post = @voice.posts.new(params[:post])
    if @post.save!
      status = :ok
    else
      status = :unprocessable_entity
    end
    
    respond_with(@post, :location => @voice, :status => status, :content_type => "text/plain")
  end

  def show
    @post = @voice.posts.find(params[:id])
    render :layout => false
  end

  def remote_page_info
    info = {}

    begin
      if params[:url]
        scrape = Scrapers::Link.new(params[:url]).scraper
        info = {:title => scrape.title, :description => scrape.description, :images => scrape.images}
      end

      puts info.as_json

      render :json => info
    rescue Timeout::Error, StandardError
      render :json => {:error => "Can't reach the URL. Please try with another URL."}
    end
  end

  def destroy
    post = Post.find(params[:id]).destroy
    render :json => post, :status => :ok
  end

  def notify_js_error
    raise Exception.new("EmbedlyDelay: The resource took more than 1 minute.")
    render :nothing => true
  end

  private

  def find_voice
    slug = Slug.find_by_text(params[:voice_id])
    @voice = slug.voice
  end

end

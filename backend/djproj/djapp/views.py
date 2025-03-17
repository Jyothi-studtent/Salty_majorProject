from sqlite3 import IntegrityError
from django.shortcuts import render,redirect, get_object_or_404
from django.http import HttpResponseBadRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import *
from rest_framework import status
from rest_framework.response import Response
from django.middleware.csrf import get_token
from djproj.settings import EMAIL_HOST_USER
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from django.core.mail import send_mail
from .serializers import *
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework import generics
import json
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.http import require_POST
from social_django.models import UserSocialAuth
from django.core.exceptions import ObjectDoesNotExist
import random
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils.crypto import get_random_string

@csrf_exempt 
def ReactViews(request):
    if request.method == 'GET':
        project_id = request.GET.get('projectId')
        try:
            pid1 = Project.objects.get(projectid=project_id)
            issues = issue.objects.filter(projectId=pid1,sprint__isnull=True)
            serializer = IssueSerializer(issues, many=True)
            return JsonResponse(serializer.data,safe=False)
        except Project.DoesNotExist:
            return JsonResponse({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)
        except issue.DoesNotExist:
            return JsonResponse({"error": "Issues not found for this project"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt      
def add_issue(request):
  
    if request.method == 'POST':
        data = json.loads(request.body)
        issue_name = data.get('IssueName') 
        pid=data.get('projectId') 
        sprint=data.get('sprint') 
       
        issueType=data.get('IssueType')
        pid1 = Project.objects.get(projectid =pid)
        if sprint!=None:
            sprint=Sprint.objects.get(sprint=sprint)

        if issue_name:
            try:
                new_issue = issue.objects.create(IssueName=issue_name, projectId=pid1,sprint=sprint)

                return JsonResponse({'success': True, 'message': 'Issue added successfully', 'issue_id': new_issue.issue_id})
            
            except IntegrityError :
                print("eroorrrrrrrrrrrrr hai")
                return Response({"error": "An issue with this name already exists in the project."},
                                status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return JsonResponse({'success': False, 'message': str(e)})
        else:
            return JsonResponse({'success': False, 'message': 'Issue name is required'})
    else:
        return JsonResponse({'success': False, 'message': 'Invalid request method'})

def get_csrf_token(request):
    return JsonResponse({"csrfToken": get_token(request)})

@csrf_exempt
def create_group(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            group_name = data.get('groupname')
            group_id = data.get('groupid')
            group_head = data.get('grouphead')

            if not group_name or not group_head:
                return JsonResponse({'error': 'Group name and group head are required'}, status=400)

            if Group.objects.filter(group_id=group_id).exists():
                return JsonResponse({'error': 'Group ID already exists'}, status=400)

            group = Group(group_id=group_id, group_name=group_name, group_head=group_head)
            group.save()
            GroupMember.objects.create(group=group, member_email=group_head)  # Add the creator as a member

            response_data = {
                'message': 'Group created successfully',
                'groupid': group.group_id,
                'groupname': group.group_name,
                'grouphead': group.group_head
            }

            return JsonResponse(response_data, status=201)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    else:
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=405)



@csrf_exempt
def group_list(request):
    if request.method == 'GET':
        email = request.GET.get('email', None)
        if not email:
            return JsonResponse({'error': 'Email parameter is missing'}, status=400)
        
        try:
            user = UserAccount.objects.get(email=email)
        except UserAccount.DoesNotExist:
            return JsonResponse({'error': 'User does not exist'}, status=404)
        
        if user.is_admin:
            groups = Group.objects.all()
        else:
            # Retrieve groups where the email matches the group head
            groups_head = Group.objects.filter(group_head=email)
            # Retrieve groups where the email matches a group member
            groups_member = GroupMember.objects.filter(member_email=email).values('group')
            # Combine both lists of groups
            groups = list(groups_head) + list(Group.objects.filter(pk__in=groups_member))
        
        # Create a list of group data including group head information
        group_data = [
            {
                'group_id': group.group_id,
                'group_name': group.group_name,
                'group_head': group.group_head
            } 
            for group in groups
        ]
        return JsonResponse(group_data, safe=False)
    else:
        return JsonResponse({'error': 'Only GET requests are allowed'}, status=405)


@csrf_exempt
def invite_group_members(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            group_id = data.get('group_id')
            emails = data.get('emails')

            group = get_object_or_404(Group, group_id=group_id)

            for email in emails:
                # Generate unique invitation token
                token = get_random_string(32)
                GroupInvitation.objects.create(group=group, invitee_email=email, token=token)

                # Send invitation email
                invite_link = f"http:/localhost:3000/view_invitation?token={token}"
                subject = f"Join {group.group_name} created by {group.group_head}"
                message = f"""
                You have been invited to join the group "{group.group_name}" created by {group.group_head}.
                Click below to view the invitation:
                {invite_link}
                """
                send_mail(subject, message, EMAIL_HOST_USER, [email])

            return JsonResponse({'message': 'Invitations sent successfully!'}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Only POST requests allowed'}, status=405)



@csrf_exempt
def create_project(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            project_name = data.get('projectname')
            teamlead = data.get('teamlead')
            projectid = data.get('projectid')
            group_id = data.get('group_id')  # Get group ID from request

            if not project_name or not projectid or not teamlead:
                return JsonResponse({'error': 'Missing required fields'}, status=400)

            # Ensure group_id is valid
            group = None
            if group_id:
                try:
                    group = Group.objects.get(group_id=group_id)
                except Group.DoesNotExist:
                    return JsonResponse({'error': 'Invalid group ID'}, status=400)

            # Create project and assign to group
            project = Project(
                projectid=projectid,
                projectname=project_name,
                teamlead_email=teamlead,
                group=group  # Assign project to group
            )
            project.save()

            response_data = {
                'message': 'Project created successfully',
                'projectid': project.projectid,
                'projectname': project.projectname,
                'teamlead_email': project.teamlead_email,
                'group_id': group_id
            }

            return JsonResponse(response_data, status=201)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    else:
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=405)

@csrf_exempt
def csrf_token(request):
    csrf_token = get_token(request)
    print(csrf_token)
    return JsonResponse({'csrfToken': csrf_token})
    
@csrf_exempt
def generate_invitation_token(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        projectid = data.get('projectid')
          # Get projectid from the request data
        serializer = URLSafeTimedSerializer('your-secret-key')
        token = serializer.dumps(email)
        try:
            project_ins = Project.objects.get(projectid=projectid)
        except Project.DoesNotExist:
            return JsonResponse({'error': 'Project not found'}, status=404)
        if Project_TeamMember.objects.filter(team_member_email=email,project=project_ins).exists() or project_ins.teamlead_email == email :
            return JsonResponse({'error': 'Email is already associated with this project'}, status=400)
        else:
            invitation_link = f'http://localhost:3000/accept-invitation?projectid={projectid}&token={token}'
            subject = "Welcome to Salty- Join Project"
            message = f"Welcome! You're invited to join the project {project_ins.projectname}. \n Click the link to accept:\n{invitation_link}"
            send_mail(subject, message, EMAIL_HOST_USER, [email], fail_silently=True)
            print("sent")
            return JsonResponse({'token': token})
       
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    

@csrf_exempt
def verify_invitation_token(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        token = data.get('token')
        projectid = data.get('projectId')
        print(token, "gfkkkkkkkkkkkkkkkkkkkkverify")
        serializer = URLSafeTimedSerializer('your-secret-key')
        try:
            email = serializer.loads(token, max_age=18000)  # Token expires in 5 hours
            user_exists = UserAccount.objects.filter(email=email).exists()
            print(user_exists,"jjjjj")
            if user_exists:
                return JsonResponse({'action': 'login','projectid':projectid})  # Email is associated with an existing user
            else:
                return JsonResponse({'action': 'signup','projectid':projectid})  # Email is not associated with any user account
        except SignatureExpired:
            return JsonResponse({'error': 'Token has expired'}, status=400)
        except BadSignature:
            return JsonResponse({'error': 'Invalid token'}, status=400)
        
@csrf_exempt

def process_invitation_token(request):
    if request.method == 'POST':
        # Extract email, project ID, and invitation token from the request data
        data = json.loads(request.body)
        email = data.get('email')
        project_id = data.get('projectid')
        try:
            project_ins = Project.objects.get(projectid=project_id)
        except Project.DoesNotExist:
            return JsonResponse({'error': 'Project not found'}, status=404)
        # Check if the email is already a team member for the given project
        if Project_TeamMember.objects.filter(team_member_email=email, project=project_ins).exists():
            return JsonResponse({'message': 'Email is already a team member for this project'}, status=400)
        # Add the new team member to the project
        team_member = Project_TeamMember.objects.create(team_member_email=email, project=project_ins)
        team_member.save()
        return JsonResponse({'message': 'Invitation processed successfully'})
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    

@csrf_exempt
def project_list(request):
    if request.method == 'GET':
        email = request.GET.get('email', None)
        group_id = request.GET.get('group_id', None)

        if not email:
            return JsonResponse({'error': 'Email parameter is missing'}, status=400)
        if not group_id:
            return JsonResponse({'error': 'Group ID parameter is missing'}, status=400)

        try:
            user = UserAccount.objects.get(email=email)
        except UserAccount.DoesNotExist:
            return JsonResponse({'error': 'User does not exist'}, status=404)

        # ✅ If the user is Admin or Group Head, return all projects of that group
        if user.is_admin or Group.objects.filter(group_id=group_id, group_head=email).exists():
            projects = Project.objects.filter(group__group_id=group_id)

        else:
            # ✅ Otherwise, return only projects where they are Team Lead or Team Member
            projects_lead = Project.objects.filter(group__group_id=group_id, teamlead_email=email)
            projects_member = Project_TeamMember.objects.filter(
                team_member_email=email, 
                project__group__group_id=group_id
            ).values('project')

            projects = list(projects_lead) + list(Project.objects.filter(pk__in=projects_member))

        # ✅ Format response data
        project_data = [
            {
                'projectid': project.projectid,
                'projectname': project.projectname,
                'teamlead_email': project.teamlead_email,
                'group_id': project.group.group_id if project.group else None
            } 
            for project in projects
        ]

        return JsonResponse(project_data, safe=False)

    return JsonResponse({'error': 'Only GET requests are allowed'}, status=405)
    
@csrf_exempt
def get_team_members(request):
    if request.method == 'GET':
        project_id = request.GET.get('projectid')
        if project_id:
            try:
                # Fetch all team members for the specified project from the database
                team_members_emails = Project_TeamMember.objects.filter(project__projectid=project_id).values_list('team_member_email', flat=True)
                # Fetch user details for team members
                team_members = UserAccount.objects.filter(email__in=team_members_emails).values('email', 'first_name', 'last_name')
                # Convert queryset to list of dictionaries
                team_members_list = list(team_members)
                return JsonResponse({'team_members': team_members_list})
            except Exception as e:
                return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)
        else:
            return JsonResponse({'error': 'Project ID is required'}, status=400)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def get_sprints(request):
    if request.method == 'GET':
        project_id = request.GET.get('projectid')
        # print("pid", project_id)
        if project_id:
            base_query = Sprint.objects.exclude(status='completed')
            sprints = Sprint.objects.filter(project__projectid=project_id).values('sprint', 'start_date', 'end_date')
            sprint_list = list(sprints)
            # print(sprint_list)
            return JsonResponse({'sprint_in_project': sprint_list})
        else:
            return JsonResponse({'error': 'Project ID is required'}, status=400)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
@csrf_exempt
def get_activesprints(request):
    if request.method == 'GET':
        project_id = request.GET.get('projectid')
        if project_id:
            sprints = Sprint.objects.filter(project__projectid=project_id, status='complete').values('sprint', 'start_date', 'end_date')
            sprint_list = list(sprints)
            return JsonResponse({'sprint_in_project': sprint_list})
        else:
            return JsonResponse({'error': 'Project ID is required'}, status=400)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def create_issue(request):
    if request.method == 'POST':
        # Get form data from request.POST and file from request.FILES
        data = request.POST
        file = request.FILES.get('Attachment')  # Fetch the uploaded file
        # Get the project by ID
        pid1 = Project.objects.get(projectid=data.get('ProjectId'))
      
        sprint = Sprint.objects.get(sprint=data.get('Sprint')) if data.get('Sprint') else None
   
        # Create a new issue with the provided data
        new_issue = issue.objects.create(
            IssueName=data.get('IssueName'),
            IssueType=data.get('IssueType'),
            sprint=sprint,
            projectId=pid1,
            status=data.get('Status', 'TODO'),
            assignee=data.get('Assignee', ''),
            assigned_by=data.get('Assigned_by', ''),
            description=data.get('Description', ''),
           
            StoryPoint=data.get('StoryPoint', 1),
            Priority=data.get('Priority', 'Medium'),
            file_field=file,  # Save the file from the request
        )

        return JsonResponse({'message': 'Issue created successfully'})
    else:
        return JsonResponse({'error': 'Only POST method allowed'}, status=405)
    




import traceback  # For detailed exception traceback

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q

from django.db.models import F

@csrf_exempt
def filters_function(request):
    if request.method == 'GET':
        projectid = request.GET.get('projectid')
        filter_type = request.GET.get('filter')
        status = request.GET.get('status')
        current_user = request.GET.get('currentUser')

        if not projectid:
            return JsonResponse({"error": "Project ID is required"}, status=400)

        # Exclude issues from completed sprints
        base_query = issue.objects.exclude(sprint__status='completed').annotate(sprint_status=F('sprint__status'))

        if filter_type == 'all_issues':
            issues = list(base_query.filter(projectId_id=projectid).values())
        elif filter_type == 'assigned_to_me':
            issues = list(base_query.filter(projectId_id=projectid, assignee=current_user).values())
        elif filter_type == 'unassigned':
            issues = list(base_query.filter(projectId_id=projectid, assignee='').values())
        elif filter_type == 'complete_sprint_issue':
            completed_sprints = Sprint.objects.filter(project__projectid=projectid, status='completed').values_list('id', flat=True)
            issues = list(issue.objects.filter(sprint_id__in=completed_sprints).annotate(sprint_status=F('sprint__status')).values())
        elif filter_type == 'Status':
            issues = list(base_query.filter(projectId_id=projectid, status=status).values())
        else:
            if filter_type == 'complete_issues':
                completed_sprints = Sprint.objects.filter(status="completed")

        
                issues_query = issue.objects.filter(sprint__in=completed_sprints)


                issues = list(issues_query.values())
            elif filter_type == 'all_issues':
                issues = list(base_query.filter(projectId_id=projectid).values())  
            elif filter_type == 'assigned_to_me':
                issues = list(base_query.filter(projectId_id=projectid, assignee=current_user).values())
            elif filter_type == 'unassigned':
                issues = list(base_query.filter(projectId_id=projectid, assignee='').values())
            
            elif filter_type == 'Status':
                issues = list(base_query.filter(projectId_id=projectid, status=status).values()) 
            else:
                return JsonResponse({"error": "Invalid filter type"}, status=400)
        return JsonResponse(issues, safe=False)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)



@csrf_exempt
def update_issue(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        try:
            issue_obj = issue.objects.get(issue_id=data['issue_id'])
            issue_obj.IssueType = data.get('IssueType', issue_obj.IssueType)
            issue_obj.description = data.get('description', issue_obj.description)
            issue_obj.status = data.get('status', issue_obj.status)
            issue_obj.assignee = data.get('assignee', issue_obj.assignee)
            issue_obj.assigned_by = data.get('assigned_by', issue_obj.assigned_by)
            issue_obj.sprint_id = data.get('sprint_id', issue_obj.sprint_id)
            issue_obj.projectId_id = data.get('projectId_id', issue_obj.projectId_id)
            issue_obj.file_field = data.get('file_field', issue_obj.file_field)
            issue_obj.Priority = data.get('Priority', issue_obj.Priority)
            story_point = data.get('StoryPoint')
            if story_point is not None:
                try:
                    issue_obj.StoryPoint = int(story_point)
                except ValueError:
                    return JsonResponse({'status': 'error', 'message': 'StoryPoint must be a number'})

            issue_obj.save()
            return JsonResponse({'status': 'success'})
        
        except issue.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Issue not found'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})


from datetime import datetime
from django.shortcuts import get_object_or_404

@csrf_exempt
def create_comment(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        issue_id = data.get('issue_id')
        project_id = data.get('project_id')
        written_by = data.get('written_by')
        comment_body = data.get('comment_body')
        issue_obj = get_object_or_404(issue, issue_id=issue_id)
        comment = Comments(
            IssueId=issue_obj,
            ProjectId=issue_obj.projectId,
            WrittenBy=written_by,
            CommentBody=comment_body,
            CreatedAt=timezone.now(),
            EditedAt=timezone.now()
        )
        comment.save()
        return JsonResponse({'message': 'Comment created successfully'}, status=201)
    return JsonResponse({'error': 'Invalid request method'}, status=400)

def fetch_comments(request, issue_id):
    if request.method == 'GET':
        print(request, issue_id)
        comments = Comments.objects.filter(IssueId=issue_id).order_by('-CreatedAt')
        comments_list = [
            {
                'comment_id': comment.CommentId,
                'issue_id': comment.IssueId.issue_id,
                'project_id': comment.ProjectId.projectid if comment.ProjectId else None,
                'written_by': comment.WrittenBy,
                'comment_body': comment.CommentBody,
                'created_at': comment.CreatedAt.strftime('%Y-%m-%d %H:%M:%S'),
                'edited_at': comment.EditedAt.strftime('%Y-%m-%d %H:%M:%S'),
            } for comment in comments
        ]
        return JsonResponse(comments_list, safe=False)
    return JsonResponse({'error': 'Invalid request method'}, status=400)

from datetime import timedelta

@csrf_exempt
def edit_comment(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        comment_id = data.get('comment_id')
        new_comment_body = data.get('comment_body')
        user_email = data.get('user_email')
        comment = get_object_or_404(Comments, CommentId=comment_id)
        if comment.WrittenBy != user_email:
            return JsonResponse({'error': 'You are not authorized to edit this comment'}, status=403)
        comment.CommentBody = new_comment_body
        comment.EditedAt = timezone.now()
        comment.save()
        return JsonResponse({'message': 'Comment edited successfully'}, status=200)
    return JsonResponse({'error': 'Invalid request method'}, status=400)

from django.db.models import Count

@csrf_exempt
def project_issue_statistics(request, project_id):
    assigned_issues = issue.objects.filter(projectId=project_id).values('assignee').annotate(total=Count('id'))
    done_issues = issue.objects.filter(projectId=project_id, status='Done').values('assignee').annotate(total=Count('id'))
    assigned_data = {item['assignee']: item['total'] for item in assigned_issues}
    done_data = {item['assignee']: item['total'] for item in done_issues}
    print(done_data, assigned_data)
    return JsonResponse({'assigned_data': assigned_data, 'done_data': done_data})

@csrf_exempt
def create_sprint(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        project_id = data.get('project')
        sprint_id = data.get('sprint')
        try:
            pid1 = Project.objects.get(projectid=project_id)
        except Project.DoesNotExist:
            return JsonResponse({'message': 'Project not found'}, status=404)
        try:
            sprint_instance = Sprint.objects.get(sprint=sprint_id, project=pid1)
            sprint_instance.sprintName=data.get("sprint_name")
            sprint_instance.start_date = data.get('start_date')
            sprint_instance.end_date = data.get('end_date')
            sprint_instance.sprint_goal = data.get('sprint_goal')
            sprint_instance.status = data.get('status')
            sprint_instance.save()
            return JsonResponse({'message': 'Sprint updated successfully'})
        except Sprint.DoesNotExist:
            return JsonResponse({'message': 'Sprint not found'}, status=404)
    return JsonResponse({'message': 'Invalid request method'}, status=400)


@csrf_exempt
def update_sprintName(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            sprint_name = data.get('sprintName', None)
            pid1 = Project.objects.get(projectid=data.get("projectid"))
            if sprint_name:
                sprint = Sprint.objects.create(
                    sprint=sprint_name,project=pid1,sprintName=sprint_name
                )
                return JsonResponse({"message": "Sprint name is required"})
            else:
                return JsonResponse({"message": "Sprint name is required"}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({"message": "Invalid JSON format in request body"}, status=400)
    else:
        return JsonResponse({"message": "Only POST requests are allowed"}, status=405)
    

@csrf_exempt
def countsprints(request):
    if request.method == 'GET':
        project_id = request.GET.get('projectId')
        pid1 = Project.objects.get(projectid=project_id)
        if project_id:
            try:
                sprints = Sprint.objects.filter(project_id=pid1)
                sprints_count = sprints.count()
                serialized_sprints = SprintSerializer( sprints,many=True) 
                
                return JsonResponse({"count": sprints_count, "sprints": serialized_sprints.data}, status=200)
            except Exception as e:
                return JsonResponse({"error": str(e)}, status=500)
        else:
            return JsonResponse({"error": "Project ID is required"}, status=400)
    else:
        return JsonResponse({"error": "Only GET requests are allowed"}, status=405)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def issuesOfSprint(request):
    if request.method == 'GET':
        project_id = request.GET.get('projectId')
        sprint = request.GET.get('sprintName')
        
        pid1 = Project.objects.get(projectid=project_id)
        sprint1 = Sprint.objects.get(sprint=sprint)
        try:
            issues = issue.objects.filter(projectId=pid1,sprint=sprint1)
            serializer = IssueSerializer(issues, many=True)
            return JsonResponse(serializer.data, safe=False)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    
    else:
        return JsonResponse({"error": "Project ID is required"}, status=400)

@csrf_exempt
def update_issueStatus(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            issue_name = data.get('issue', None)
            new_status = data.get('status', None)
            pid1 = Project.objects.get(projectid=data.get("projectId"))
            if issue_name:
                Issue = issue.objects.get(IssueName=issue_name,projectId=pid1)
                print(" motto",Issue)
                Issue.status = new_status
                Issue.save()
                return JsonResponse({"message": "Issue status updated"})
            else:
                return JsonResponse({"message": "issue name is required"}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({"message": "Invalid JSON format in request body"}, status=400)
    else:
        return JsonResponse({"message": "Only POST requests are allowed"}, status=405)
    
@csrf_exempt
def delete_sprint(request):
    print("inside delete")
    if request.method == 'GET':
        try:
            project_id = request.GET.get('projectId')
            sprint_name = request.GET.get('sprintName')
            pid1 = Project.objects.get(projectid=project_id)
            sprintInstance = Sprint.objects.get(sprint=sprint_name, project=pid1)
            sprintInstance.delete()
            return JsonResponse({'message': 'Sprint deleted successfully'}, status=200)
        except Sprint.DoesNotExist:
            return JsonResponse({'error': 'Sprint not found'}, status=404)
        except Project.DoesNotExist:
            return JsonResponse({'error': 'Project not found'}, status=404)
    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def delete_issue(request):
    print("inside delete")
    if request.method == 'GET':
        try:
            project_id = request.GET.get('projectId')
            issue_name = request.GET.get('issueName')
            pid1 = Project.objects.get(projectid=project_id)
            issueInstance = issue.objects.get(IssueName=issue_name, projectId=pid1)
            issueInstance.delete()
            return JsonResponse({'message': 'Sprint deleted successfully'}, status=200)
        except Sprint.DoesNotExist:
            return JsonResponse({'error': 'Sprint not found'}, status=404)
        except Project.DoesNotExist:
            return JsonResponse({'error': 'Project not found'}, status=404)
    return JsonResponse({'error': 'Invalid request method'}, status=400)


@csrf_exempt
def updateSprintStatus(request):
    if request.method == 'GET':
        project_id = request.GET.get('projectId')
        sprint_name = request.GET.get('sprintName')
        status=request.GET.get('status')
        try:
            project = Project.objects.get(projectid=project_id)
            sprint = Sprint.objects.get(sprint=sprint_name, project=project)
            print("inside try")
            print(sprint.sprintName,sprint.status,status)
            sprint.status =status
            print("before save")
            sprint.save()
            print("after save")
            return JsonResponse({"message": "Sprint status updated to completed"}, status=200)

        except Project.DoesNotExist:
            return JsonResponse({"error": "Project not found"}, status=404)
        except Sprint.DoesNotExist:
            return JsonResponse({"error": "Sprint not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=400)
    
@csrf_exempt
def update_issueSprint(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            issue_name = data.get('issue', None)
            new_sprint = data.get('sprint', None)
            pid1 = Project.objects.get(projectid=data.get("projectId"))
            sprint = Sprint.objects.get(sprint=new_sprint, project=pid1)
            if issue_name:
                Issue = issue.objects.get(IssueName=issue_name,projectId=pid1)
                print(" motto",Issue)
                Issue.sprint = sprint
                Issue.save()
                return JsonResponse({"message": "Issue status updated"})
            else:
                return JsonResponse({"message": "issue name is required"}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({"message": "Invalid JSON format in request body"}, status=400)
    else:
        return JsonResponse({"message": "Only POST requests are allowed"}, status=405)
@api_view(['POST'])
@permission_classes([IsAuthenticated])  
@csrf_exempt
def update_issue_name(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            old_issue_name = data.get('oldIssueName', None)
            new_issue_name = data.get('newIssueName', None)
            project_id = data.get('projectId')
            issue_obj = issue.objects.get(projectId=project_id, IssueName=old_issue_name)
            issue_obj.IssueName = new_issue_name
            issue_obj.save()
            return JsonResponse({'message': 'Issue name updated successfully'})
        except issue.DoesNotExist:
            return JsonResponse({'error': 'Issue not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)
    
@csrf_exempt
def update_issueassignee(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            issue_name = data.get('issue', None)
            assignee = data.get('assignee', None)
            pid1 = Project.objects.get(projectid=data.get("projectId"))
            if issue_name:
                Issue = issue.objects.get(IssueName=issue_name,projectId=pid1)
                print("meeeeeeeeeeeeeeeeeeeee",assignee)
                print(" motto",Issue)
                Issue.assignee = assignee
                Issue.save()

                return JsonResponse({"message": "Issue status updated"})
            else:
                return JsonResponse({"message": "issue name is required"}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({"message": "Invalid JSON format in request body"}, status=400)
    else:
        return JsonResponse({"message": "Only POST requests are allowed"}, status=405)
@csrf_exempt

def gantt_chart_data(request):
    projectid = request.GET.get('projectid')
    print(projectid,"gantt")
    if projectid:
        sprints = Sprint.objects.filter(project_id=projectid).values('sprint', 'sprintName', 'start_date', 'end_date', 'sprint_goal', 'status')
    else:
        sprints = Sprint.objects.none().values('sprint', 'sprintName', 'start_date', 'end_date', 'sprint_goal', 'status')  # returns an empty QuerySet
    
    sprint_data = list(sprints)
    return JsonResponse({'sprints': sprint_data})

@csrf_exempt
def get_random_color():
    return "#{:06x}".format(random.randint(0, 0xFFFFFF))

def generate_placeholder_picture(email):
    """Generate a placeholder picture with random background color and initial."""
    return {
        "background_color": get_random_color(),
        "initial": email[0].upper() if email else ''
    }

def get_team_lead(request, projectid):
    if request.method == "GET":
        try:
            project = get_object_or_404(Project, projectid=projectid)
            team_lead_email = project.teamlead_email
            try:
                team_lead_user = UserAccount.objects.get(email=team_lead_email)
                team_lead_social_auth = UserSocialAuth.objects.get(uid=team_lead_email)
                team_lead_picture_url = team_lead_social_auth.extra_data.get('picture', None)
            except ObjectDoesNotExist:
                team_lead_picture_url = None

            if not team_lead_picture_url:
                team_lead_picture_url = {
                    "background_color": team_lead_user.color,
                    "initial": team_lead_user.first_letter
                }
            team_members_data = []
            team_members = Project_TeamMember.objects.filter(project=projectid)
            for team_member in team_members:
                if team_member.team_member_email != team_lead_email:
                    try:
                        team_member_user = UserAccount.objects.get(email=team_member.team_member_email)
                        try:
                            team_member_social_auth = UserSocialAuth.objects.get(provider='google-oauth2', uid=team_member.team_member_email)
                            team_member_picture_url = team_member_social_auth.extra_data.get('picture', None)
                        except ObjectDoesNotExist:
                            team_member_picture_url = None
                        if not team_member_picture_url:
                            team_member_picture_url = {
                                "background_color": team_member_user.color,
                                "initial": team_member_user.first_letter
                            }
                        team_members_data.append({
                            'email': team_member.team_member_email,
                            'picture_url': team_member_picture_url
                        })
                    except ObjectDoesNotExist:
                        team_members_data.append({
                            'email': team_member.team_member_email,
                            'picture_url': generate_placeholder_picture(team_member.team_member_email)
                        })
            return JsonResponse({
                'team_lead_email': team_lead_email,
                'team_lead_picture_url': team_lead_picture_url,
                'team_members': team_members_data
            })
        except Exception as e:
            print(e)
            return JsonResponse({'error': 'An error occurred'}, status=500)
        
@csrf_exempt
def get_user_details(request):
    if request.method == 'GET':
        email = request.GET.get('email')
        if email:
            try:
                user = UserAccount.objects.get(email=email)
                data = {
                    'email': user.email,
                    'is_admin': user.is_admin,
                    'is_staff':user.is_staff,
                    'is_active':user.is_active,

                    # Add other user details you need
                }
                
                return JsonResponse(data)
            except UserAccount.DoesNotExist:
                return JsonResponse({'error': 'User not found'}, status=404)
        else:
            return JsonResponse({'error': 'Email parameter is missing'}, status=400)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    

@csrf_exempt
def get_user_profile(request):
    if request.method == 'GET':
        email = request.GET.get('email')
        user = UserAccount.objects.get(email = email)
        data = {
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'usn': user.usn,
            'phone_number': user.phone_number,
            'first_letter' : user.first_letter,
            'color': user.color,
        }
        print(data)
    return JsonResponse(data)

@csrf_exempt
def update_user_profile(request):
    print("getting update request", request)
    if request.method == 'PUT':
        data = json.loads(request.body)
        email = data.get('email')
        user = get_object_or_404(UserAccount, email=email)
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.usn = data.get('usn', user.usn)
        user.phone_number = data.get('phone_number', user.phone_number)
        user.save()
        response_data = {
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'usn': user.usn,
            'phone_number': user.phone_number,
        }

        return JsonResponse(response_data)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)




@csrf_exempt
def get_assignee(request):
    if request.method == 'GET':
        project_id = request.GET.get('projectid')
        pid1 = Project.objects.get(projectid=project_id)
        if project_id:
            try:
                # Fetch all team members for the specified project from the database
                team_members_emails = Project_TeamMember.objects.filter(project=project_id).values_list('team_member_email', flat=True)
                # Fetch user details for team members
                team_members = UserAccount.objects.filter(email__in=team_members_emails).values('email', 'first_name', 'last_name')
                # Convert queryset to list of dictionaries
                team_members_list = list(team_members)
                return JsonResponse({'team_members': team_members_list})
            except Exception as e:
                return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)
        else:
            return JsonResponse({'error': 'Project ID is required'}, status=400)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def fetch_assignee_color(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        assignee_email = data.get('assignee')
        print(assignee_email)
        print("inside the fetch______")
        try:
            user = UserAccount.objects.get(email=assignee_email)
            print(user)
            user_data = {
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'usn': user.usn,
                'phone_number': user.phone_number,
                'profile_photo': user.profile_photo.url if user.profile_photo else None,
                'first_letter': user.first_letter,
                'color': user.color
            }
            print(user_data)
            return JsonResponse({'user': user_data}, status=200)
        except UserAccount.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=405)



class FileUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        files = request.FILES.getlist('files')
        file_objs = []
        for file in files:
            file_obj = UploadedFile(file=file)
            file_obj.save()
            file_objs.append(file_obj)
        return Response(status=status.HTTP_201_CREATED)
@csrf_exempt
def update_storypoints(request):
    
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            issue_name = data.get('issue', None)
            new_status = data.get('status', None)
            print("insideeeeeeeeeeeeeee stroyyyyyyyyyyyyyyyyy",new_status,issue_name)
            try:
                new_status = int(new_status)
            except (ValueError, TypeError):
                return JsonResponse({'error': 'Invalid status value. It must be an integer.'}, status=400)
            
            pid1 = Project.objects.get(projectid=data.get("projectId"))
            print(data,issue_name,new_status, "storyyyyyyyyyyyyyy pointssss")

            if issue_name:
                Issue = issue.objects.get(IssueName=issue_name,projectId=pid1)
                
                Issue.StoryPoint = new_status
                Issue.save()

                return JsonResponse({"message": "Issue status updated"})
            else:
                return JsonResponse({"message": "issue name is required"}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({"message": "Invalid JSON format in request body"}, status=400)
    else:
        return JsonResponse({"message": "Only POST requests are allowed"}, status=405)
    

def list_projects_user_is_part_of(request):
    if request.method == 'GET':
        email = request.GET.get('email', None)
        
        if not email:
            return JsonResponse({'error': 'Email parameter is missing'}, status=400)
        
        try:
            user = UserAccount.objects.get(email=email)
        except UserAccount.DoesNotExist:
            return JsonResponse({'error': 'User does not exist'}, status=404)
        
        if user.is_admin:
            projects = Project.objects.all()
        else:
            projects_lead = Project.objects.filter(teamlead_email=email)
            projects_member = Project_TeamMember.objects.filter(team_member_email=email).values_list('project', flat=True)
            projects = projects_lead | Project.objects.filter(pk__in=projects_member)
        
        project_data = [
            {
                'projectid': project.projectid,
                'projectname': project.projectname,
                'teamlead_email': project.teamlead_email,
                'group_id': project.group.group_id if project.group else None
            } 
            for project in projects
        ]
        
        return JsonResponse(project_data, safe=False)
    else:
        return JsonResponse({'error': 'Only GET requests are allowed'}, status=405)
  
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from djapp.models import UploadedFile
from django.views.decorators.http import require_http_methods
from django.middleware.csrf import get_token

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_file(request, file_id):
    if request.method != "DELETE":
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    file_obj = get_object_or_404(UploadedFile, id=file_id)

    # Delete the file from storage
    file_obj.file.delete(save=False)  # Removes the file from storage

    # Delete the database entry
    file_obj.delete()

    return JsonResponse({'message': 'File deleted successfully!'}, status=200)


def list_files(request):
    issue_id = request.GET.get('issue_id')
    files = UploadedFile.objects.filter(issue_id=issue_id)
    file_list = [{'id': file.id, 'file_name': file.file.name, 'file_url': file.file.url, 'uploaded_at': file.uploaded_at} for file in files]
    
    return JsonResponse(file_list, safe=False)

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import UploadedFile, issue

@csrf_exempt
def upload_file(request):
    print("line1 ")
    if request.method != 'POST':
        print("line2 ")
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    print("line3 ")
    if 'files' not in request.FILES:
        return JsonResponse({'error': 'No files uploaded'}, status=400)

    issue_id = request.POST.get('issue_id')
    print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n', issue_id, "\n@@@@@@@@@@@@@@@@@@@@")

    if not issue_id:
        return JsonResponse({'error': 'Missing issue_id'}, status=400)

    try:
        # Correctly get the issue using issue_id, which is UUID
        fetched_issue = issue.objects.get(issue_id=issue_id)
        print("????????????????????????????????????????\n", fetched_issue)
    except issue.DoesNotExist:
        return JsonResponse({'error': 'Invalid issue ID'}, status=400)

    uploaded_files = []
    for file in request.FILES.getlist('files'):
        uploaded_file = UploadedFile.objects.create(file=file, issue=fetched_issue)
        uploaded_files.append({
            'file_url': uploaded_file.file.url,  # Ensure MEDIA_URL is set in settings.py
            'file_name': uploaded_file.file.name,
            'uploaded_at': uploaded_file.uploaded_at
        })

    return JsonResponse({'message': 'Files uploaded successfully!', 'files': uploaded_files})

from django.http import JsonResponse
from django.contrib.auth import get_user_model
from .models import GroupMember, Group

User = get_user_model()
@csrf_exempt
def get_eligible_users(request):
    """Fetch users who are staff and active"""
    users = User.objects.filter(is_staff=True, is_active=True,is_admin=False).values('email', 'first_name', 'last_name')
    return JsonResponse(list(users), safe=False)

@csrf_exempt
def add_group_members(request):
    """Add selected members to a group"""
    if request.method == "POST":
        import json
        data = json.loads(request.body)
        group_id = data.get("group_id")
        member_emails = data.get("member_emails", [])

        try:
            group = Group.objects.get(group_id=group_id)
            for email in member_emails:
                GroupMember.objects.get_or_create(group=group, member_email=email)

            return JsonResponse({"message": "Members added successfully"}, status=201)
        except Group.DoesNotExist:
            return JsonResponse({"error": "Group not found"}, status=404)

    return JsonResponse({"error": "Invalid request"}, status=400)


def get_group_members(request):
    group_id = request.GET.get('group_id')

    if not group_id:
        return JsonResponse({'error': 'Group ID is required'}, status=400)

    members = GroupMember.objects.filter(group__group_id=group_id).values('member_email')

    return JsonResponse(list(members), safe=False)

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import issue, Project  # Ensure you import the correct models
@csrf_exempt
def create_compulsory_issue(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)  # Parse JSON data from the request
            print("Received data:", data)  # Debugging: Print the entire payload

            issue_name = data.get('issue_name')
            description = data.get('description')
            story_points = data.get('story_points', 1)
            priority = data.get('priority', 'Medium')
            deadline = data.get('deadline', None)
            sprint =  None
            projects = data.get('projects', [])  # List of project IDs
            assigned_by = data.get('assigned_by', '')  # Email of the user creating the issue

            if not issue_name or not description or not projects:
                return JsonResponse({'error': 'Issue name, description, and projects are required'}, status=400)

            created_issues = []

            for project_id in projects:
                try:
                    # Fetch the project
                    print(f"Fetching project with ID: {project_id}")  # Debugging: Print project ID
                    project = Project.objects.get(projectid=project_id)
                    print(f"Found project: {project.projectid}")  # Debugging: Confirm project exists

                    # Create the issue for the project
                    new_issue = issue.objects.create(
                        IssueName=issue_name,
                        description=description,
                        StoryPoint=story_points,
                        Priority=priority,
                        Deadline=deadline,
                        projectId=project,  # Pass the Project object directly
                        assigned_by=assigned_by,
                        status='To-Do',
                        sprint=sprint,
                        IsCompulsory=True,  # Mark the issue as compulsory
                    )
                    created_issues.append({
                        'issue_id': str(new_issue.issue_id),
                        'project_id': project_id,
                    })
                except Project.DoesNotExist:
                    print(f"Project with ID {project_id} does not exist")  # Debugging: Project not found
                    return JsonResponse({'error': f'Project with ID {project_id} does not exist'}, status=400)
                except Exception as e:
                    print(f"Error creating issue for project {project_id}: {e}")  # Debugging: Catch any other errors
                    return JsonResponse({'error': str(e)}, status=500)

            return JsonResponse({
                'message': 'Compulsory issues created successfully',
                'issues': created_issues,
            }, status=201)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            print(f"Unexpected error: {e}")  # Debugging: Catch any unexpected errors
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Only POST method allowed'}, status=405)












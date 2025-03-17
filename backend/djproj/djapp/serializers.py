from djoser.serializers import UserCreateSerializer
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import *
User = get_user_model()

class UserCreateSerializer(UserCreateSerializer):
    class Meta(UserCreateSerializer.Meta):
        model = User
        fields = ('id', 'email', 'password','first_name','last_name',"is_admin",'is_active', 'is_staff', 'usn', 'phone_number', 'profile_photo', 'first_letter', 'color')
class IssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = issue
        fields = '__all__'
class SprintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sprint
        fields = ['sprint',"sprintName", 'start_date', 'end_date', 'sprint_goal', 'project','status']

class UploadedFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = '__all__'
class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['projectid', 'projectname', 'teamlead_email', 'group']
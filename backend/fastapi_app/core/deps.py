from asgiref.sync import sync_to_async


async def get_current_user():
    """
    Auth disabled — always return a demo user.
    """
    from apps.users.models import User
    user = await sync_to_async(User.objects.first)()

    if not user:
        raise Exception("No user found. Create a demo user in DB.")

    return user